"use strict";
const FUEL_PUMPS = 9;
const PUMPS_PER_LANE = 3;
const LITERS_PER_SECOND = 1.5;
const MIN_VEHICLE_INTERVAL = 1500;
const MAX_VEHICLE_INTERVAL = 2200;
const MAX_QUEUE_SIZE = 5;
const AGITATION_TIMEOUT = 2000;
// const STATISTICS_INTERVAL = 1000000;
const initialPumps = new Array(FUEL_PUMPS).fill(true);
const initialQueue = [];
const initialLitersDispensed = 0;
const initialVehiclesServiced = 0;
const initialVehiclesLeft = 0;
const initialFuelTransactions = [];
const generateVehicle = () => {
    const type = getRandomVehicleType();
    const fuelTypes = getFuelTypes(type);
    const tankCapacity = getTankCapacity(type);
    const fuelLevel = getRandomFuelLevel(tankCapacity);
    return { type, fuelTypes, tankCapacity, fuelLevel };
};
const getRandomVehicleType = () => {
    const types = ["Car", "Van", "HGV"];
    console.log("Math.floor(Math.random() * types.length):", Math.floor(Math.random() * types.length));
    return types[Math.floor(Math.random() * types.length)];
};
const getFuelTypes = (type) => {
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
const getTankCapacity = (type) => {
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
const getRandomFuelLevel = (tankCapacity) => {
    return Math.floor((Math.random() * tankCapacity) / 4) + 1;
};
const getNextAvailablePumpIndex = (pumps) => {
    return pumps.findIndex((pump) => pump);
};
const fuelVehicle = (vehicle, pumpIndex) => {
    console.log("vehicle::", vehicle);
    const fuelType = vehicle.fuelTypes[Math.floor(Math.random() * vehicle.fuelTypes.length)];
    const litersToDispense = vehicle.tankCapacity - vehicle.fuelLevel;
    //   Math.min(
    //     vehicle.tankCapacity - vehicle.fuelLevel,
    //     (LITERS_PER_SECOND * AGITATION_TIMEOUT) / 1000
    //   );
    console.log("vehicle.tankCapacity", vehicle.tankCapacity);
    console.log("vehicle.fuelLevel", vehicle.fuelLevel);
    console.log("vehicle.tankCapacity - vehicle.fuelLevel:", vehicle.tankCapacity - vehicle.fuelLevel);
    console.log("ERTU2:", litersToDispense.toFixed(2));
    const litersDispensed = Number(litersToDispense.toFixed(2));
    console.log("ERTU:", litersDispensed);
    vehicle.fuelLevel += Number(litersDispensed); // add dispensed fuel into vehicle's fuel level
    console.log("vehicle.fuelLevel:", vehicle.fuelLevel);
    const dateTime = new Date();
    return { dateTime, fuelType, litersDispensed };
};
const updateFuelPumps = (pumps, pumpIndex, value) => {
    return pumps.map((pump, index) => (index === pumpIndex ? value : pump));
};
const addVehicleToQueue = (queue, vehicle) => {
    return [...queue, vehicle];
};
const processQueue = (queue, pumps) => {
    const transactions = [];
    const newQueue = [];
    let newPumps = pumps.slice();
    let i = 0;
    while (i < queue.length && getNextAvailablePumpIndex(newPumps) !== -1) {
        const pumpIndex = getNextAvailablePumpIndex(newPumps);
        const vehicle = queue[i];
        const transaction = fuelVehicle(vehicle, pumpIndex);
        // console.log("sstransaction:", transaction);
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
const updateStatistics = (litersDispensed, vehiclesServiced, vehiclesLeft, fuelTransactions) => {
    console.log("litersDispensed:::::::::::::::!", litersDispensed);
    const newLitersDispensed = litersDispensed + Number(litersDispensed.toFixed(2));
    const newVehiclesServiced = vehiclesServiced + fuelTransactions.length;
    //   console.log("vehiclesServiced:", vehiclesServiced);
    //   console.log("vehiclesLeft:", vehiclesLeft);
    //   console.log("MAX_QUEUE_SIZE:", MAX_QUEUE_SIZE);
    //   console.log("fuelTransactions:", fuelTransactions);
    const newVehiclesLeft = vehiclesLeft + MAX_QUEUE_SIZE - fuelTransactions.length;
    const newFuelTransactions = fuelTransactions.concat();
    return [
        newLitersDispensed,
        newVehiclesServiced,
        newVehiclesLeft,
        newFuelTransactions,
    ];
};
const printStatistics = (litersDispensed, vehiclesServiced, vehiclesLeft
//   newFuelTransaction: FuelTransaction[]
) => {
    console.log("---------------------------------------------");
    console.log("hasdhah:", litersDispensed);
    console.log(`Liters dispensed: ${litersDispensed.toFixed(2)}`);
    console.log(`Vehicles serviced: ${vehiclesServiced}`);
    console.log(`Vehicles left: ${vehiclesLeft}`);
    //   console.log(`Vehicles FuelTransaction: ${newFuelTransaction}`);
};
const simulateFuelStation = (pumps, queue, litersDispensed, vehiclesServiced, vehiclesLeft, fuelTransactions) => {
    console.log("litea:", litersDispensed);
    console.log("queue.length::::", queue.length);
    const timeToNextVehicle = Math.floor(Math.random() * (MAX_VEHICLE_INTERVAL - MIN_VEHICLE_INTERVAL) +
        MIN_VEHICLE_INTERVAL);
    if (queue.length < MAX_QUEUE_SIZE) {
        // A new vehicle is created randomly every 1500 to 2200 milliseconds unless there are five
        // vehicles in the queue.
        const vehicle = generateVehicle();
        console.log("generateVehicle", vehicle);
        const newQueue = addVehicleToQueue(queue, vehicle);
        console.log("newQueuenewQueuenewQueuenewQueuenewQueue:", newQueue);
        simulateFuelStation(pumps, newQueue, litersDispensed, vehiclesServiced, vehiclesLeft, fuelTransactions);
    }
    else {
        const [transactions, newQueue, newPumps] = processQueue(queue, pumps);
        const [newLitersDispensed, newVehiclesServiced, newVehiclesLeft, newFuelTransactions,] = updateStatistics(litersDispensed, vehiclesServiced, vehiclesLeft, transactions);
        printStatistics(newLitersDispensed, newVehiclesServiced, newVehiclesLeft);
        setTimeout(() => simulateFuelStation(newPumps, newQueue, newLitersDispensed, newVehiclesServiced, newVehiclesLeft, newFuelTransactions), timeToNextVehicle);
    }
};
simulateFuelStation(initialPumps, initialQueue, initialLitersDispensed, initialVehiclesServiced, initialVehiclesLeft, initialFuelTransactions);
