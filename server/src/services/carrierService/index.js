import MockAdapter from './mockAdapter.js';
// import FedExAdapter from './fedexAdapter.js';
// import UPSAdapter from './upsAdapter.js';
// import DHLAdapter from './dhlAdapter.js';

const adapters = {
    mock: MockAdapter,
    // fedex: FedExAdapter,
    // ups: UPSAdapter,
    // dhl: DHLAdapter
};

export const getAdapter = (carrier, config) => {
    const AdapterClass = adapters[carrier.toLowerCase()] || MockAdapter;
    return new AdapterClass(config);
};
