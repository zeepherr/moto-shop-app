import type { CheckoutReceipt } from "../types";

export const money = (amount: number) => `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character] ?? character);

export function openReceiptPrintWindow(receipt: CheckoutReceipt): boolean {
  const printWindow = window.open("", "_blank", "popup,width=800,height=900");
  if (!printWindow) return false;

  const itemRows = receipt.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}<small>${money(item.unitPrice)} each</small></td>
      <td class="center">${item.quantity}</td>
      <td class="right">${money(item.lineTotal)}</td>
    </tr>
  `).join("");
  const discountRow = receipt.discountAmount > 0
    ? `<div class="discount"><dt>Products discount (${receipt.discountRate}%)</dt><dd>−${money(receipt.discountAmount)}</dd></div>`
    : "";
  const changeRow = receipt.paymentMethod === "CASH"
    ? `<div><dt>Change</dt><dd>${money(Math.max(receipt.receivedAmount - receipt.total, 0))}</dd></div>`
    : "";
  const completedAt = escapeHtml(new Date(receipt.completedAt).toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  }));

  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Receipt ${escapeHtml(receipt.orderNumber)}</title>
        <style>
          @page { margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #111827; font: 14px/1.5 Arial, sans-serif; }
          main { max-width: 720px; margin: 0 auto; }
          header { padding-bottom: 16px; border-bottom: 1px solid #d9e1ef; text-align: center; }
          h1 { margin: 0; font-size: 22px; }
          header p { margin: 2px 0 0; color: #596579; }
          .order-meta { margin-top: 14px; font-size: 12px; }
          .customer { margin: 20px 0 12px; }
          .customer p { margin: 4px 0; }
          .muted, small, dt { color: #596579; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 8px 0; border-bottom: 1px solid #d9e1ef; color: #596579; text-align: left; font-size: 12px; }
          td { padding: 10px 0; border-bottom: 1px solid #e5e9f0; vertical-align: top; }
          small { display: block; font-size: 12px; }
          .center { text-align: center; }
          .right { text-align: right; white-space: nowrap; }
          dl { width: min(100%, 280px); margin: 18px 0 0 auto; }
          dl div { display: flex; justify-content: space-between; gap: 16px; margin: 4px 0; }
          dd { margin: 0; text-align: right; }
          .discount { color: #087f5b; }
          .total { padding-top: 8px; border-top: 1px solid #d9e1ef; font-weight: 700; }
          footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #d9e1ef; color: #596579; text-align: center; font-size: 12px; }
          tr, dl, footer { break-inside: avoid; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>HrungMoto</h1>
            <p>Sales receipt</p>
            <p class="order-meta">Order ${escapeHtml(receipt.orderNumber)}<br>${completedAt}</p>
          </header>
          <section class="customer">
            <p><span class="muted">Customer:</span> ${escapeHtml(receipt.customerName)}</p>
            ${receipt.vehicleLabel ? `<p><span class="muted">Motorcycle:</span> ${escapeHtml(receipt.vehicleLabel)}</p>` : ""}
            <p><span class="muted">Payment:</span> ${escapeHtml(receipt.paymentMethod ?? "No payment due")}</p>
          </section>
          <table>
            <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Amount</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <dl>
            <div><dt>Subtotal</dt><dd>${money(receipt.subtotal)}</dd></div>
            ${discountRow}
            <div class="total"><dt>Total</dt><dd>${money(receipt.total)}</dd></div>
            <div><dt>Received</dt><dd>${money(receipt.receivedAmount)}</dd></div>
            ${changeRow}
          </dl>
          <footer>Thank you for choosing HrungMoto.</footer>
        </main>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
  printWindow.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 150);

  return true;
}
