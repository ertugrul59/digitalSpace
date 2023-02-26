interface FuelTransaction {
  dateTime: Date;
  fuelType: string;
  litersDispensed: number;
}

interface Vehicle {
  type: string;
  tankCapacity: number;
  fuelTypes: string[];
  fuelLevel: number;
}

const FUEL_PUMPS = 9;
const PUMPS_PER_LANE = 3;
const LITERS_PER_SECOND = 1.5;
const MIN_VEHICLE_INTERVAL = 1500;
const MAX_VEHICLE_INTERVAL = 2200;
const MAX_QUEUE_SIZE = 5;

const initialPumps = new Array<boolean>(FUEL_PUMPS).fill(true);
const initialQueue: Vehicle[] = [];
const initialLitersDispensed = 0;
const initialVehiclesServiced = 0;
const initialVehiclesLeft = 0;
const initialFuelTransactions: FuelTransaction[] = [];

const generateVehicle = (): Vehicle => {
  const type = getRandomVehicleType();
  const fuelTypes = getFuelTypes(type);
  const tankCapacity = getTankCapacity(type);
  const fuelLevel = getRandomFuelLevel(tankCapacity);
  return { type, fuelTypes, tankCapacity, fuelLevel };
};

const getRandomVehicleType = (): string => {
  const types = ["Car", "Van", "HGV"];

  return types[Math.floor(Math.random() * types.length)];
};

const getFuelTypes = (type: string): string[] => {
  switch (type) {
    case "Car":
      return ["Diesel", "LPG", "Unleaded"];
    case "Van":
      return ["Diesel", "LPG"];
    case "HGV":
      return ["Diesel"];
    default:
      return [];
  }
};

const getTankCapacity = (type: string): number => {
  switch (type) {
    case "Car":
      return 10;
    case "Van":
      return 80;
    case "HGV":
      return 150;
    default:
      return 0;
  }
};

const getRandomFuelLevel = (tankCapacity: number): number => {
  return Math.floor((Math.random() * tankCapacity) / 4) + 1;
};

const getNextAvailablePumpIndex = (pumps: boolean[]): number => {
  return pumps.findIndex((pump) => pump);
};

const fuelVehicle = (vehicle: Vehicle, pumpIndex: number): FuelTransaction => {
  const fuelType =
    vehicle.fuelTypes[Math.floor(Math.random() * vehicle.fuelTypes.length)];
  const litersToDispense = vehicle.tankCapacity - vehicle.fuelLevel;

  const litersDispensed = Number(litersToDispense.toFixed(2));

  vehicle.fuelLevel += Number(litersDispensed); // add dispensed fuel into vehicle's fuel level

  const dateTime = new Date();

  return { dateTime, fuelType, litersDispensed };
};

const updateFuelPumps = (
  pumps: boolean[],
  pumpIndex: number,
  value: boolean
): boolean[] => {
  return pumps.map((pump, index) => (index === pumpIndex ? value : pump));
};

const addVehicleToQueue = (queue: Vehicle[], vehicle: Vehicle): Vehicle[] => {
  return [...queue, vehicle];
};

const processQueue = (
  queue: Vehicle[],
  pumps: boolean[]
): [FuelTransaction[], Vehicle[], boolean[]] => {
  const transactions: FuelTransaction[] = [];
  const newQueue: Vehicle[] = [];
  let newPumps: boolean[] = pumps.slice();
  let i = 0;
  while (i < queue.length && getNextAvailablePumpIndex(newPumps) !== -1) {
    const pumpIndex = getNextAvailablePumpIndex(newPumps);
    const vehicle = queue[i];
    const transaction = fuelVehicle(vehicle, pumpIndex);

    transactions.push(transaction);
    newPumps = updateFuelPumps(newPumps, pumpIndex, false);
    i++;
  }
  while (i < queue.length) {
    newQueue.push(queue[i]);
    i++;
  }
  return [transactions, newQueue, newPumps];
};

const updateStatistics = (
  litersDispensed: number,
  vehiclesServiced: number,
  vehiclesLeft: number,
  fuelTransactions: FuelTransaction[]
): [number, number, number, FuelTransaction[]] => {
  const newLitersDispensed =
    litersDispensed + Number(litersDispensed.toFixed(2));
  const newVehiclesServiced = vehiclesServiced + fuelTransactions.length;

  const newVehiclesLeft =
    vehiclesLeft + MAX_QUEUE_SIZE - fuelTransactions.length;
  const newFuelTransactions = fuelTransactions.concat();
  return [
    newLitersDispensed,
    newVehiclesServiced,
    newVehiclesLeft,
    newFuelTransactions,
  ];
};

const printStatistics = (
  litersDispensed: number,
  vehiclesServiced: number,
  vehiclesLeft: number
): void => {
  console.log("---------------------------------------------");
  console.log(`Liters dispensed: ${litersDispensed.toFixed(2)}`);
  console.log(`Vehicles serviced: ${vehiclesServiced}`);
  console.log(`Vehicles left: ${vehiclesLeft}`);
};

const simulateFuelStation = (
  pumps: boolean[],
  queue: Vehicle[],
  litersDispensed: number,
  vehiclesServiced: number,
  vehiclesLeft: number,
  fuelTransactions: FuelTransaction[]
): void => {
  // A new vehicle is created randomly every 1500 to 2200 milliseconds unless there are five
  // vehicles in the queue.
  const timeToNextVehicle = Math.floor(
    Math.random() * (MAX_VEHICLE_INTERVAL - MIN_VEHICLE_INTERVAL) +
      MIN_VEHICLE_INTERVAL
  );

  if (queue.length < MAX_QUEUE_SIZE) {
    const vehicle = generateVehicle();
    const newQueue = addVehicleToQueue(queue, vehicle);

    simulateFuelStation(
      pumps,
      newQueue,
      litersDispensed,
      vehiclesServiced,
      vehiclesLeft,
      fuelTransactions
    );
  } else {
    const [transactions, newQueue, newPumps] = processQueue(queue, pumps);
    const [
      newLitersDispensed,
      newVehiclesServiced,
      newVehiclesLeft,
      newFuelTransactions,
    ] = updateStatistics(
      litersDispensed,
      vehiclesServiced,
      vehiclesLeft,
      transactions
    );
    printStatistics(newLitersDispensed, newVehiclesServiced, newVehiclesLeft);
    setTimeout(
      () =>
        simulateFuelStation(
          newPumps,
          newQueue,
          newLitersDispensed,
          newVehiclesServiced,
          newVehiclesLeft,
          newFuelTransactions
        ),
      timeToNextVehicle
    );
  }
};

simulateFuelStation(
  initialPumps,
  initialQueue,
  initialLitersDispensed,
  initialVehiclesServiced,
  initialVehiclesLeft,
  initialFuelTransactions
);
