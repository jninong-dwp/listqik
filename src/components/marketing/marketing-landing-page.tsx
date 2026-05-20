"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StartNowLanguageToggle } from "@/components/marketing/start-now-language-toggle";
import { useSiteLocale } from "@/components/site-locale-provider";
import { fullServiceMailto, getStartNowCopy } from "@/i18n/start-now-copy";
import { startNowSubsonicPricingHref } from "@/lib/stripe-subsonic-landing-promo";

export function MarketingLandingPage() {
  const { locale, ready } = useSiteLocale();
  const copy = getStartNowCopy(locale);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const [avatarMuted, setAvatarMuted] = useState(true);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [offerDismissed, setOfferDismissed] = useState(false);
  const agentMailto = fullServiceMailto(locale);
  const subsonicOfferHref = startNowSubsonicPricingHref(locale);

  const toggleAvatarSound = () => {
    const video = avatarVideoRef.current;
    if (!video) return;
    const nextMuted = !avatarMuted;
    video.muted = nextMuted;
    if (!nextMuted) {
      video.volume = 1;
      void video.play().catch(() => {});
    }
    setAvatarMuted(nextMuted);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowGiftPopup(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-emerald-400/40 border-t-emerald-300" />
      </div>
    );
  }

  return (
    <>
      <div className="startNowLangBar">
        <StartNowLanguageToggle />
      </div>

      <main className="pageShell">
        <section className="hero">
          <div className="heroInner reveal">
            <div className="heroContent">
              <p className="eyebrow">{copy.hero.eyebrow}</p>
              <h1>{copy.hero.title}</h1>
              <p className="heroCopy">{copy.hero.body}</p>
              <div className="heroActions">
                <Link href={subsonicOfferHref} scroll={false} className="btn btnPrimary">
                  {copy.hero.ctaPrimary}
                </Link>
                <a href="#compare" className="btn btnSecondary">
                  {copy.hero.ctaSecondary}
                </a>
              </div>
              <ul className="heroStats" aria-label={copy.hero.statsLabel}>
                <li>
                  <strong>24h</strong> {copy.hero.statResponse}
                </li>
                <li>
                  <strong>100%</strong> {copy.hero.statSatisfaction}
                </li>
                <li className="heroStatWide">{copy.hero.statReach}</li>
                <li className="heroStatHighlight">
                  <strong>$9,000</strong> {copy.hero.statSavings}
                </li>
              </ul>
            </div>

            <aside className="heroAvatarCard" aria-label={copy.avatar.label}>
              <p className="avatarKicker">{copy.avatar.kicker}</p>
              <div className="avatarVideoWrap">
                <video
                  key={copy.videoSrc}
                  ref={avatarVideoRef}
                  className="avatarVideo"
                  src={copy.videoSrc}
                  autoPlay
                  loop
                  muted={avatarMuted}
                  playsInline
                  preload="metadata"
                  onClick={toggleAvatarSound}
                  aria-label={
                    avatarMuted ? copy.avatar.unmute : copy.avatar.mute
                  }
                />
              </div>
            </aside>
          </div>
        </section>

        <section id="compare" className="section pricing reveal">
          <div className="sectionHeading">
            <p className="sectionKicker">{copy.pricing.kicker}</p>
            <h2>{copy.pricing.title}</h2>
            <p>{copy.pricing.body}</p>
          </div>
          <p className="pricingHighlight">{copy.pricing.highlight}</p>

          <div className="pricingGrid">
            {copy.plans.map((plan) => (
              <article
                key={plan.id}
                className={`pricingCard${plan.id === "subsonic" ? " isPopular" : ""}`}
              >
                <p className={`planBadge${plan.badgeDark ? " isDark" : ""}`}>
                  {plan.badge}
                </p>
                <h3>{plan.name}</h3>
                <p className="planCopy">{plan.copy}</p>
                <p className="planPrice">
                  {plan.priceWas ? (
                    <span className="planPriceWas">{plan.priceWas}</span>
                  ) : null}
                  {plan.price}
                </p>
                <p className="planSub">{plan.sub}</p>
                {plan.mailto ? (
                  <a
                    href={agentMailto}
                    className={`btn ${plan.primary ? "btnPrimary" : "btnSecondary"} wide`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={
                      plan.id === "subsonic"
                        ? subsonicOfferHref
                        : plan.checkoutHref ?? "/pricing"
                    }
                    className={`btn ${plan.primary ? "btnPrimary" : "btnSecondary"} wide`}
                  >
                    {plan.cta}
                  </Link>
                )}
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="seller" className="section sellerCta reveal">
          <h2>{copy.sellerCta.title}</h2>
          <p>{copy.sellerCta.body}</p>
          <div className="heroActions">
            <Link href={subsonicOfferHref} className="btn btnPrimary">
              {copy.sellerCta.cta}
            </Link>
          </div>
        </section>
      </main>

      {showGiftPopup ? (
        <div
          className="giftPopupOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-popup-title"
        >
          <div className="giftPopup">
            <button
              type="button"
              className="giftPopupClose"
              aria-label={copy.offer.closeLabel}
              onClick={() => {
                setShowGiftPopup(false);
                setOfferDismissed(true);
              }}
            >
              ×
            </button>
            <p className="giftPopupKicker">{copy.offer.kicker}</p>
            <h3 id="gift-popup-title">{copy.offer.title}</h3>
            <p>{copy.offer.body}</p>
            <p className="giftCoupon">{copy.offer.coupon}</p>
            <Link
              href={subsonicOfferHref}
              scroll={false}
              className="btn btnPrimary wide"
              onClick={() => {
                setShowGiftPopup(false);
                setOfferDismissed(true);
              }}
            >
              {copy.offer.cta}
            </Link>
          </div>
        </div>
      ) : null}

      {offerDismissed && !showGiftPopup ? (
        <button
          type="button"
          className="claimOfferMini"
          onClick={() => {
            setShowGiftPopup(true);
            setOfferDismissed(false);
          }}
        >
          {copy.offer.floating}
        </button>
      ) : null}
    </>
  );
}
