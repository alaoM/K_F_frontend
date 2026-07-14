const tickets = [
  { subject: 'My new ticket', date: '02/05/2025', type: 'Website problem', priority: 'High', status: 'Open' },
  { subject: 'Another ticket', date: '03/06/2025', type: 'Partner request', priority: 'Medium', status: 'Closed' },
  { subject: 'Yet another ticket', date: '19/04/2025', type: 'Complaint', priority: 'Urgent', status: 'Closed' },
]

const priorityColor = (p: string) => {
  switch (p) {
    case 'High': return 'text-orange-500'
    case 'Medium': return 'text-blue-500'
    case 'Low': return 'text-green-500'
  }
}

export default function Disputes() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Tickets</h2>

      <table className="w-full text-left">
        <thead className="border-b border-[#e2e2e2] text-gray-500">
          <tr>
            <th className="py-3">Ticket subject</th>
            <th>Date submitted</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t, i) => (
            <tr key={i} className="border-b border-[#e2e2e2]">
              <td className="py-4">{t.subject}</td>
              <td>{t.date}</td>
              <td>{t.type}</td>
              <td className={priorityColor(t.priority)}>{t.priority}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}