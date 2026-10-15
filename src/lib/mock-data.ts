/** Static placeholder data used when the database is not connected. */

export type MockHouse = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  bedCount: number;
  openBeds: number;
};

export const MOCK_HOUSES: MockHouse[] = [
  {
    id: "oak",
    name: "Oak Street House",
    address: "142 Oak Street",
    city: "Phoenix",
    state: "AZ",
    bedCount: 4,
    openBeds: 3,
  },
  {
    id: "river",
    name: "River Bend House",
    address: "88 River Bend Rd",
    city: "Tempe",
    state: "AZ",
    bedCount: 3,
    openBeds: 3,
  },
];
