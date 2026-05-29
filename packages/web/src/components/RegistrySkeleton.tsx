export default function RegistrySkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="table-scroll" aria-hidden>
      <table className="data-table data-table--skeleton">
        <thead>
          <tr>
            <th scope="col">Status</th>
            <th scope="col">Underlying</th>
            <th scope="col">Confidential</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td>
                <span className="skeleton skeleton--badge" />
              </td>
              <td>
                <span className="skeleton skeleton--title" />
                <span className="skeleton skeleton--line" />
                <span className="skeleton skeleton--mono" />
              </td>
              <td>
                <span className="skeleton skeleton--title" />
                <span className="skeleton skeleton--line" />
                <span className="skeleton skeleton--mono" />
              </td>
              <td>
                <span className="skeleton skeleton--btn" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
