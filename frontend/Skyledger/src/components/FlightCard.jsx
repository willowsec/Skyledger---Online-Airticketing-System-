const fmt = (d) =>
  new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtDur = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export default function FlightCard({ flight, cabinClass, onSelect }) {
  return (
    <div className="bg-surface rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow grid grid-cols-2 md:grid-cols-[1fr_auto_1fr_auto_auto] gap-4 items-center">
      {/* Airline */}
      <div className="flex items-center gap-3 col-span-2 md:col-span-1">
        {flight.airline?.logo ? (
          <img
            src={flight.airline.logo}
            alt={flight.airline.name}
            className="h-8 w-8 object-contain rounded-md"
          />
        ) : (
          <div className="h-8 w-8 bg-slate-100 rounded-md flex items-center justify-center text-text-secondary font-bold text-xs">
            {flight.airline?.name?.charAt(0) || "A"}
          </div>
        )}
        <div>
          <div className="font-medium text-body-sm text-text-primary">
            {flight.airline?.name}
          </div>
          <div className="text-label text-text-secondary">
            {flight.flightNumber}
          </div>
        </div>
      </div>

      {/* Departure */}
      <div className="text-center md:text-left">
        <div className="text-[22px] font-medium text-text-primary leading-tight">
          {fmt(flight.departureTime)}
        </div>
        <div className="text-body-sm text-text-secondary mt-0.5">
          {flight.origin}
        </div>
      </div>

      {/* Duration + stops */}
      <div className="flex flex-col items-center justify-center px-4 w-full">
        <div className="text-label text-text-secondary mb-1">
          {fmtDur(flight.duration)}
        </div>
        <div className="w-full relative flex items-center justify-center">
          <div className="w-full border-t border-slate-300 absolute top-1/2 left-0 -translate-y-1/2"></div>
          <div className="w-2 h-2 rounded-full bg-slate-300 relative z-10"></div>
        </div>
        <div
          className={`text-label mt-1 ${
            flight.stops === 0 ? "text-success font-medium" : "text-warning font-medium"
          }`}
        >
          {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Arrival */}
      <div className="text-center md:text-right">
        <div className="text-[22px] font-medium text-text-primary leading-tight">
          {fmt(flight.arrivalTime)}
        </div>
        <div className="text-body-sm text-text-secondary mt-0.5">
          {flight.destination}
        </div>
      </div>

      {/* Price + select */}
      <div className="col-span-2 md:col-span-1 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-left md:text-right">
          <div className="text-[20px] font-semibold text-text-primary leading-tight">
            ₹{flight.price?.toLocaleString("en-IN")}
          </div>
          <div className="text-label text-text-secondary mt-0.5 md:mb-2">
            <span className="capitalize">{cabinClass}</span> · {flight.availableSeats} seats left
          </div>
        </div>
        <button
          onClick={onSelect}
          className="bg-primary hover:bg-accent text-surface px-6 py-2 rounded-lg text-button-text shadow-sm transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}
