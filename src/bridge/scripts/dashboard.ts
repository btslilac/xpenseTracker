import { sharedScript } from './shared'

export function dashboardScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__;
if (typeof window.__stitchRenderDashboard === 'function') {
  window.__stitchRenderDashboard(data);
} else {
  const balanceNode = document.getElementById('total-expense-main');
  const incomeNode = document.getElementById('total-income');
  const expenseNode = document.getElementById('total-expense-small');
  const budgetNode = document.getElementById('monthly-budget');
  const greetingNode = document.getElementById('greeting-text');

  if (balanceNode) balanceNode.textContent = data.summary?.expenses || '0';
  if (incomeNode) incomeNode.textContent = data.summary?.income || 'KSh 0';
  if (expenseNode) expenseNode.textContent = data.summary?.expenses || 'KSh 0';
  if (budgetNode) budgetNode.textContent = data.summary?.budget || '';
  if (greetingNode) greetingNode.textContent = data.greeting || 'Welcome!';
}

document.getElementById('show-all-history')?.addEventListener('click', () => {
  window.__stitchPost({ type: 'navigate', route: 'transactions' });
});
`
}
