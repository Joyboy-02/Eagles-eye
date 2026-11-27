/**
 * Realistic sample text & CSV datasets for testing detection, checksum rejection,
 * partial/full/pseudonym redaction, and quoted CSV handling.
 * All numbers are synthetic test fixtures.
 */

export const SAMPLE_RAW_TEXT = `=== Customer Support & KYC Audit Log (Synthetic Sample) ===
Ticket #INC-4092 | Agent: Rohan Sharma

1. Primary Contact & Identity:
   - Email: rohan.sharma@example.com (secondary: rohan.sharma@example.com, ops-alert@finsecure.in)
   - Mobile (India): +91-9876543210 | Alt Mobile: 9123456789
   - US Support Desk: +1 (415) 555-0198
   - PAN Card: ABCDE1234F
   - Valid Aadhaar (Verhoeff passes): 2341 2341 2346
   - Invalid Aadhaar (Verhoeff fails, synthetic): 2341 2341 2345

2. Payment & Network Telemetry:
   - Valid Visa (Luhn passes): 4532-0151-1283-0366
   - Valid Mastercard (Luhn passes): 5425 2334 3010 9903
   - Invalid Card / Order Ref (Luhn fails): 4532-0151-1283-0367
   - Random 16-digit Tracking ID (Luhn fails): 9988776655443322
   - Client IPv4: 192.168.14.88 | Gateway IPv4: 10.0.42.19
   - Invalid IPv4 Octet (Rejected): 299.168.1.404
   - Edge Node IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
   - Loopback IPv6: ::1

3. Internal Reference Note:
   - Employee Tag: EMP-8841 requested review for rohan.sharma@example.com from 192.168.14.88.`;

export const SAMPLE_CSV_TEXT = `customer_name,email,phone,pan,aadhaar,card_number,notes
"Sharma, Rohan",rohan.sharma@example.com,+91-9876543210,ABCDE1234F,2341 2341 2346,4532-0151-1283-0366,"Logged in from 192.168.14.88; says ""call me back"""
"Patel, Meera",meera.patel@corp.in,9820112233,BNZAA2318J,2341 2341 2345,4532-0151-1283-0367,"Synthetic Aadhaar & card fail checksums; IPv6 2001:db8::1"
"Nair, Vikram",rohan.sharma@example.com,+1-415-555-0198,PQRST6789L,9999 8888 7779,5425 2334 3010 9903,"Repeated email should share pseudonym"`;
