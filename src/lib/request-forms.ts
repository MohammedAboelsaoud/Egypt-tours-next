/**
 * The fields shown in each "Request on WhatsApp" form. Each label is also the
 * line label in the message you receive.
 */
export type RequestField = {
  /** Also the label used in the WhatsApp message. */
  label: string
  type: "date" | "number" | "text" | "textarea"
  placeholder?: string
  defaultValue?: string
  min?: number
  required?: boolean
}

/** Ready-made forms for each kind of booking. */
export const REQUEST_FORMS = {
  hotel: [
    { label: "Check-in", type: "date", required: true },
    { label: "Nights", type: "number", defaultValue: "2", min: 1, required: true },
    { label: "Rooms", type: "number", defaultValue: "1", min: 1 },
    { label: "Guests", type: "number", defaultValue: "2", min: 1 },
    { label: "Name", type: "text", placeholder: "Your name" },
    { label: "Notes", type: "textarea", placeholder: "Room type, arrival time, questions…" },
  ],
  vehicle: [
    { label: "Start date", type: "date", required: true },
    { label: "Days", type: "number", defaultValue: "1", min: 1, required: true },
    { label: "Passengers", type: "number", defaultValue: "2", min: 1 },
    { label: "Pickup", type: "text", placeholder: "e.g. Cairo airport, hotel name" },
    { label: "Name", type: "text", placeholder: "Your name" },
    { label: "Notes", type: "textarea", placeholder: "Route, flight number, questions…" },
  ],
  bus: [
    { label: "Date", type: "date", required: true },
    { label: "Days", type: "number", defaultValue: "1", min: 1 },
    { label: "Passengers", type: "number", defaultValue: "30", min: 1 },
    { label: "Route", type: "text", placeholder: "e.g. Cairo → Alexandria → Alamein", required: true },
    { label: "Name", type: "text", placeholder: "Your name or group" },
    { label: "Notes", type: "textarea", placeholder: "Event, luggage, questions…" },
  ],
  guide: [
    { label: "Date", type: "date", required: true },
    { label: "Days", type: "number", defaultValue: "1", min: 1 },
    { label: "Group size", type: "number", defaultValue: "2", min: 1 },
    { label: "Places to visit", type: "text", placeholder: "e.g. Pyramids, Egyptian Museum" },
    { label: "Name", type: "text", placeholder: "Your name" },
    { label: "Notes", type: "textarea", placeholder: "Language, interests, questions…" },
  ],
} satisfies Record<string, RequestField[]>
