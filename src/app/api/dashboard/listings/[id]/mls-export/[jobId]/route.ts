import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingMlsExportJob } from "@/models/ListingMlsExportJob";

function serialize(job: {
  _id: Types.ObjectId;
  status: string;
  progress: number;
  fileName?: string | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: job._id.toString(),
    status: job.status,
    progress: job.progress,
    fileName: job.fileName ?? "",
    error: job.error ?? "",
    startedAt: job.startedAt ? job.startedAt.toISOString() : null,
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    createdAt: job.createdAt ? job.createdAt.toISOString() : null,
    updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; jobId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id, jobId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(jobId)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const job = await ListingMlsExportJob.findOne({ _id: jobId, listingId: id });
  if (!job) {
    return NextResponse.json({ ok: false, error: "Export job not found." }, { status: 404 });
  }

  if (job.status === "QUEUED") {
    job.status = "PROCESSING";
    job.progress = 20;
    job.startedAt = new Date();
    await job.save();
  } else if (job.status === "PROCESSING") {
    const startedAtMs = job.startedAt?.getTime() ?? job.updatedAt?.getTime() ?? Date.now();
    const elapsedSec = Math.floor((Date.now() - startedAtMs) / 1000);
    if (elapsedSec >= 4) {
      job.status = "COMPLETED";
      job.progress = 100;
      job.completedAt = new Date();
    } else {
      job.progress = Math.min(95, 20 + elapsedSec * 20);
    }
    await job.save();
  }

  return NextResponse.json({ ok: true, job: serialize(job) });
}
