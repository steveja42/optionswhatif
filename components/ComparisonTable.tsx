export function ComparisonTable() {
  return (
    <div className="table-responsive">
      <table className="table table-bordered align-middle text-center mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" style={{ width: '34%' }}>Feature</th>
            <th scope="col" style={{ width: '33%' }}>Web App</th>
            <th scope="col" style={{ width: '33%' }}>Google Sheets Add-on</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start fw-semibold">Price updates</td>
            <td>Auto-Refresh every second</td>
            <td>Manual &ldquo;Update Prices&rdquo; button</td>
          </tr>
          <tr>
            <td className="text-start fw-semibold">Data persistence</td>
            <td>Ephemeral — resets on reload</td>
            <td>Permanent tab in your spreadsheet</td>
          </tr>
          <tr>
            <td className="text-start fw-semibold">Price points</td>
            <td>7-point snapshot (editable)</td>
            <td>6-point snapshot (editable)</td>
          </tr>
          <tr>
            <td className="text-start fw-semibold">Customization</td>
            <td>Edit price points in-browser</td>
            <td>Full Sheets formula customization</td>
          </tr>
          <tr>
            <td className="text-start fw-semibold">Data privacy</td>
            <td>Fetched server-side; nothing stored</td>
            <td>Sheet built locally; no data sent externally</td>
          </tr>
          <tr>
            <td className="text-start fw-semibold">Best for</td>
            <td>Quick real-time checks</td>
            <td>Ongoing tracking &amp; record-keeping</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
