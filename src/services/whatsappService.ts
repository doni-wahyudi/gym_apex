import type { Member, Sale } from '../types/gym';

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function generateExpiryReminderUrl(member: Member, gymName: string = 'ApexForge Gym'): string {
  const cleanPhone = cleanPhoneNumber(member.phone);
  const message = `Hello ${member.fullName}! 🏋️\n\nThis is a friendly reminder that your ${member.tierName} membership at *${gymName}* is set to expire on *${member.expiryDate}*.\n\nRenew today at the front desk or via our member portal to keep your streak alive! 💪`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWelcomeMessageUrl(member: Member, gymName: string = 'ApexForge Gym'): string {
  const cleanPhone = cleanPhoneNumber(member.phone);
  const message = `Welcome to *${gymName}*, ${member.fullName}! 🔥\n\nYour athlete pass has been activated.\n• Member ID: *${member.memberCode}*\n• Plan: *${member.tierName}*\n• Valid Until: *${member.expiryDate}*\n\nSee you on the gym floor for your next workout!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateReceiptWhatsappUrl(sale: Sale, memberPhone?: string, gymName: string = 'ApexForge Gym'): string {
  const phone = memberPhone ? cleanPhoneNumber(memberPhone) : '';
  const itemsSummary = sale.items.map((i) => `• ${i.quantity}x ${i.productName} ($${i.total.toFixed(2)})`).join('\n');
  const message = `🧾 *${gymName} Official Receipt*\nInvoice: *${sale.invoiceNo}*\nDate: ${new Date(sale.timestamp).toLocaleString()}\nCustomer: ${sale.customerName}\n\n${itemsSummary}\n\n*Total: $${sale.total.toFixed(2)}* (${sale.paymentMethod.toUpperCase()})\n\nThank you for training with us!`;
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
}
