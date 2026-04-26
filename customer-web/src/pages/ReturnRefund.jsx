import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function ReturnRefund() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>Return & Refund</span>
        </p>

        <h1 style={s.pageTitle}>Return & Refund Policy</h1>

        <div style={s.section}>
          <h2 style={s.sTitle}>What is SellMix's Return & Refund Policy?</h2>
          <p style={s.body}>
            While we hope you'll be happy with every order, we do have a simple and easy-to-follow
            returns process. If you discover a product is faulty or are not happy with it, please
            call our customer support at <strong>03178384342</strong> (9:00am – 9:00pm) to discuss
            your options — we'll be happy to help. If your product is faulty or damaged, we'll
            gladly refund it.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>What If I Want to Return Something?</h2>
          <p style={s.body}>
            You are eligible for a refund or replacement on items we delivered to you if the item was:
          </p>
          <ul style={s.list}>
            <li>(i) Incorrect</li>
            <li>(ii) Damaged</li>
            <li>(iii) Expired</li>
            <li>(iv) Missing</li>
          </ul>
          <p style={s.body} style={{ ...s.body, marginTop: 12 }}>
            Please contact us by calling <strong>03178384342</strong> (9:00am – 9:00pm). All
            complaints must be submitted within <strong>2 hours</strong> of receiving the order
            for highly perishable items (bread, eggs, butter, frozen products) and{' '}
            <strong>24 hours</strong> for all other items. We will send you a replacement or
            refund within <strong>24 hours</strong> of your complaint, if it is verified.
          </p>
          <p style={s.body}>
            Products should ideally be returned in their original packaging. We do not accept
            returns on perishable food items or items which cannot be re-sold for health or hygiene
            reasons once unwrapped. Our customer support team will get in touch with you to resolve
            any issue. You can also return products you are dissatisfied with at the time of
            delivery, and we will get the refund initiated for you.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>What If My Order Is Not Complete?</h2>
          <p style={s.body}>
            When your delivery arrives, if you notice an item is missing and no substitute has been
            provided, please let your driver know and your bill will be instantly recalculated. If
            you realise any items are missing after your driver has left, please contact customer
            support at <strong>03178384342</strong> within 24 hours.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>How Long Will My Refund Take to Clear?</h2>
          <p style={s.body}>
            If there is any refund on a returned item, our delivery rider will gladly refund you
            as soon as he receives the item back from you.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>What If My Refund Is Cancelled?</h2>
          <p style={s.body}>
            Before being processed, all refund requests are checked. From time to time, a refund
            request may be cancelled because it hasn't met our returns criteria.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>What If I Have a Complaint Regarding My Order?</h2>
          <p style={s.body}>
            Complaints, feedback, and queries are always welcome. Call us at{' '}
            <strong>03178384342</strong> (9:00am – 9:00pm) or message us on WhatsApp. Our
            customer care team is always happy to help.
          </p>
        </div>

        <div style={s.contactBox}>
          <p style={s.contactTitle}>Need to report an issue?</p>
          <div style={s.btns}>
            <a href="tel:03178384342" style={s.callBtn}>📞 03178384342</a>
            <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '70vh', backgroundColor: '#f5f5f5', padding: '32px 20px 60px' },
  container: { maxWidth: 820, margin: '0 auto', backgroundColor: '#fff', borderRadius: 16, padding: '40px 44px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  breadcrumb: { fontSize: 13, color: '#aaa', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 },
  breadLink: { color: COLORS.primary, textDecoration: 'none', fontWeight: 600 },
  sep: { color: '#ccc' },
  breadCur: { color: '#555' },
  pageTitle: { fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 28 },
  section: { marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #f0f0f0' },
  sTitle: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 },
  body: { fontSize: 14, color: '#555', lineHeight: 1.9, marginBottom: 10 },
  list: { paddingLeft: 24, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#555' },
  contactBox: { backgroundColor: COLORS.primary + '0f', border: `1.5px solid ${COLORS.primary}30`, borderRadius: 14, padding: '24px', textAlign: 'center', marginTop: 8 },
  contactTitle: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 },
  btns: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' },
  callBtn: { display: 'inline-block', backgroundColor: COLORS.primary, color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
  waBtn: { display: 'inline-block', backgroundColor: '#25D366', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
};
