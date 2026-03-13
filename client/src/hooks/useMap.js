import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

export const useMap = (containerRef, center = [-74.5, 40], zoom = 9) => {
    const map = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        if (map.current) return;

        maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_KEY;

        map.current = new maptilersdk.Map({
            container: containerRef.current,
            style: maptilersdk.MapStyle.STREETS,
            center,
            zoom
        });

        map.current.addControl(new maptilersdk.NavigationControl());

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [containerRef, center, zoom]);

    return map;
};
