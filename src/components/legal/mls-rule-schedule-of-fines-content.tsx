const scheduleOfFinesText = `MLS Schedule of Fines for Administrative Sanctions

MLS Rules  Fine

Listing Procedures
Failure to submit a required listing to the MLS
Section 1 - Listing Procedures,
Section 1.01 - Clear Cooperation,
Section 1.3 - Exempted Listings,
Section 1.12 - Service Area
$100

Failure to submit accurate and complete listing information
Section 1.2 - Detail on Listings Filed with the Service,
Section 1.11 - Expiration, Extension, and Renewal of Listings,
Section 1.12 - Termination Dates on Listings
$100

Failure to report and update listing information
Section 1.4 - Change of Status of Listing,
Section 1.5 - Withdrawal of Listing Prior to,
Section 1.6 - Contingencies Applicable to Listings,
Section 1.7 - Potential Short Sale Disclosure,
Section 1.8 - Listing Price Specified,
Section 2.5 - Reporting Sales to the Service,
Section 2.6 - Reporting Resolutions of Contingencies,
Section 2.8 - Reporting Cancellation of Pending Sale
$250

Failure to list properties separately
Section 1.9 - Listing Multiple Unit Properties
$100

Selling Procedures
Failure to follow showing instructions
Section 2 - Showings
$100

Failure to present an offer or provide written confirmation of an offer being submitted
Section 2.1 - Presentation of Offers,
Section 2.2 - Submission of Written Offers,
Section 2.3 - Right of Cooperating Broker in Presentation of Offer,
Section 2.4 - Right of Listing Broker in Presentation of Counter-offer
$100

Advertising a listing without authority
Section 2.7 - Advertising of Listings Filed with the Service
$100

Failure to disclose existence of an offer
Section 2.9 - Disclosing the Existence of Offers
$100

To misrepresent access to, and the ability to show, a property
Section 2.10 - Availability of Listed Property
$100

Failure to inform participants of a rejected offer satisfying the terms of the listing contract
Section 3 - Refusal to Sell
$100

Providing MLS information to brokers or firms that do not participate in MLS
Section 4 - Information for Participants Only
$100

Violation of for sale and sold sign rules
Section 4.1 - For Sale Signs,
Section 4.2 - Sold Signs
$100

Unauthorized solicitation of seller
Section 4.3 - Solicitation of Listing Filed with the Service
$100

Misuse of terms MLS and multiple listing service
Section 4.4 - Use of Terms MLS and Multiple Listing Service
$100

Failure to include cooperative compensation
Section 5 - Compensation Specified on Each Listing
$250

Failure to disclose Potential short sales
Section 5.3 - Short Sales
$100

Failure to disclose status as a principal or purchaser
Section 5.1 - Participant as Principal,
Section 5.2 - Participant as Purchaser
$100

Service Charges
Failure to pay MLS Dues, Fees and Charges
Section 6 - Service Fees and Charges
$100

Confidentiality of MLS Information
Misuse or unauthorized distribution of MLS content
Section 10 - Confidentiality of MLS Information,
Section 12 - Distribution,
Section 12.1 - Display,
Section 12.2 - Reproduction,
Section 13 - Limitations on Use of MLS Information
$500

Internet Data Exchange (IDX)
Failure to notify and provide access to an IDX display
Section 14.2.1
$100

Misuse of IDX content
Sections 14.2.2 and 14.2.2.1
$100

Failure to withhold listing or property address per seller's instructions
Section 14.2.3
$100

Failure to refresh download within 12 hours
Section 14.2.5
$100

Unauthorized distribution of MLS database
Section 14.2.6
$100

Failure to disclose the name of the brokerage firm
Section 14.2.7
$100

Failure to disable third-party comments and AVMs
Section 14.2.8
$100

Failure to include email address or telephone number for displaying broker, or to correct false data
Section 14.2.9
$100

Modifying or manipulating other participants listings
Section 14.2.11
$100

Failure to identify the listing firm
Section 14.3.2
$100

Display of prohibited fields
Section 14.3.1
$100

Failure to identify the listing agent
Section 14.3.3
$100

Subscriber's display of IDX content without participant's consent
Section 14.3.4
$100

Failure to include the MLS as the source of the information
Section 14.3.5
$100

Failure to include required disclaimers
Sections 14.3.6 and 14.3.7
$100

Failure to separate displays from other sources
Section 14.3.8
$100

Displaying prohibited statuses and sellers/occupant information
Section 14.3.9,
Section 14.10
$100

Failure to comply with the MLS advertising rule on pages with IDX listings
Section 14.3.11
$100

Virtual Office Websites (VOWs)
Failure to establish a broker-consumer relationship, or to receive participant consent for non-principal display
Section 15.1
$100

Failure to obtain a name, email address, user name, and password for registrants
Section 15.3 a. ii. and iii.
$100

Failure to expire passwords for registrants or to keep records for not less than 180 days after expiration
Section 15.3 b.
$100

Failure to provide the name, email address, user name and current password for alleged breach of MLS listing information or violation of MLS rules
Section 15.3 c.
$100

Failure to require registrant to agreement to required terms of use
Section 15.3 d.
$100

Failure to display broker's contact information or to respond to registrant inquiries
Section 15.4
$100

Failure to monitor or prevent misappropriation, scraping, or other unauthorized uses of MLS information
Section 15.5
$100

Displaying seller address when unauthorized
Section 15.6 a.
$100

Failure to execute a seller opt-out form when required, or retain the form for 1 year
Section 15.6 b. and c.
$100

Failure to disable third-party comments and AVMs
Section 15.7 a. and b.
$100

Failure to include email address or telephone number for displaying broker, or to correct false data within 48 hours
Section 15.8
$100

Failure to refresh VOW data feed within 3 days
Section 15.9
$100

Unauthorized access to VOW content
Section 15.10
$100

Failure to display participant's privacy policy
Section 15.11
$100

Failure to notify and provide access to an IDX display
Section 15.13
$100

Exceeding the number of listings to consumer inquiries
Section 15.15
$100

Failure to require registrant's passwords be changed
Section 15.16
$100`;

export function MlsRuleScheduleOfFinesContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Texas REALTORS MLS Schedule of Fines for Administrative Sanctions (source document amended by
        Texas REALTORS Executive Board on 02/14/22).
      </p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-white/85">
        {scheduleOfFinesText}
      </pre>
    </div>
  );
}
