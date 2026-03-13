export const calculateETA = async (origin, destination, carrier) => {
    // Basic ETA calculation logic
    console.log(`Calculating ETA from ${origin} to ${destination}`);
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
};
