// BookingForm — i18n translations

type Lang = 'th' | 'en' | 'cn';

export function getBookingTranslations(lang: Lang) {
  return {
    title: lang === 'th' ? 'จองที่พัก' : lang === 'cn' ? '预订房产' : 'Book Property',
    subtitle: lang === 'th' ? 'กรอกข้อมูลการจอง' : lang === 'cn' ? '填写预订信息' : 'Fill in booking details',
    step1: lang === 'th' ? 'ขั้นตอนที่ 1: วันที่' : lang === 'cn' ? '第 1 步：日期' : 'Step 1: Dates',
    step2: lang === 'th' ? 'ขั้นตอนที่ 2: ข้อมูลส่วนตัว' : lang === 'cn' ? '第 2 步：个人信息' : 'Step 2: Personal Info',
    step3: lang === 'th' ? 'ขั้นตอนที่ 3: ยืนยันเเละชำระเงิน' : lang === 'cn' ? '第 3 步：确认与付款' : 'Step 3: Confirm & Pay',
    moveInDate: lang === 'th' ? 'วันที่เข้า' : lang === 'cn' ? '入住日期' : 'Move-in Date',
    moveOutDate: lang === 'th' ? 'วันที่ออก' : lang === 'cn' ? '退租日期' : 'Move-out Date',
    rentalPeriod: lang === 'th' ? 'ระยะเวลาเช่า' : lang === 'cn' ? '租期' : 'Rental Period',
    guestName: lang === 'th' ? 'ชื่อผู้เช่า' : lang === 'cn' ? '租客姓名' : 'Guest Name',
    guestPhone: lang === 'th' ? 'เบอร์โทรศัพท์' : lang === 'cn' ? '电话号码' : 'Phone Number',
    guestEmail: lang === 'th' ? 'อีเมล' : lang === 'cn' ? '电子邮箱' : 'Email',
    specialRequests: lang === 'th' ? 'คำขอพิเศษ' : lang === 'cn' ? '特殊要求' : 'Special Requests',
    paymentMethod: lang === 'th' ? 'วิธีชำระเงิน' : lang === 'cn' ? '付款方式' : 'Payment Method',
    next: lang === 'th' ? 'ถัดไป' : lang === 'cn' ? '下一步' : 'Next',
    back: lang === 'th' ? 'ย้อนกลับ' : lang === 'cn' ? '返回' : 'Back',
    submit: lang === 'th' ? 'ยืนยันการจอง' : lang === 'cn' ? '确认预订' : 'Confirm Booking',
    cancel: lang === 'th' ? 'ยกเลิก' : lang === 'cn' ? '取消' : 'Cancel',
    months3: lang === 'th' ? '3 เดือน' : lang === 'cn' ? '3 个月' : '3 Months',
    months6: lang === 'th' ? '6 เดือน' : lang === 'cn' ? '6 个月' : '6 Months',
    months12: lang === 'th' ? '1 ปี' : lang === 'cn' ? '1 年' : '1 Year',
    months24: lang === 'th' ? '2 ปี' : lang === 'cn' ? '2 年' : '2 Years',
    custom: lang === 'th' ? 'กำหนดเอง' : lang === 'cn' ? '自定义' : 'Custom',
    cash: lang === 'th' ? 'เงินสด' : lang === 'cn' ? '现金' : 'Cash',
    transfer: lang === 'th' ? 'โอนเงิน (PromptPay QR)' : lang === 'cn' ? '银行转账' : 'Bank Transfer',
    creditCard: lang === 'th' ? 'บัตรเครดิต' : lang === 'cn' ? '信用卡' : 'Credit Card',
    success: lang === 'th' ? 'จองสำเร็จ' : lang === 'cn' ? '预订成功' : 'Booking Successful',
    summary: lang === 'th' ? 'สรุปการจอง' : lang === 'cn' ? '预订摘要' : 'Booking Summary',
    total: lang === 'th' ? 'ราคารวม' : lang === 'cn' ? '总价' : 'Total',
    deposit: lang === 'th' ? 'เงินประกัน' : lang === 'cn' ? '押金' : 'Security Deposit',
    month: lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'month',
    months: lang === 'th' ? 'เดือน' : 'months',
  };
}
