


const filters = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Bakery'];

export default function FilterChips({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (f: string) => void;
}) {
  return (
    <div className="flex gap-2 w-max">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f)}
          className={`chip whitespace-nowrap ${f === active ? 'chip-active' : 'chip-inactive'}`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
