
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Circle, Marker, Autocomplete } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Locate, 
  Save, 
  Trash2, 
  Map as MapIcon, 
  X,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const DEFAULT_CENTER = { lat: 41.8781, lng: -87.6298 }; // Chicago
const MILES_TO_METERS = 1609.34;

export default function CoverageAreaPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radius, setRadius] = useState(15); // miles
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  const [excludedZips, setExcludedZips] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing coverage data
  const coverageRef = useMemo(() => 
    user && db ? doc(db, 'provider_coverage', user.uid) : null
  , [user, db]);
  
  const { data: existingCoverage } = useDoc(coverageRef);

  useEffect(() => {
    if (existingCoverage) {
      if (existingCoverage.center) setCenter(existingCoverage.center);
      if (existingCoverage.radiusMiles) setRadius(existingCoverage.radiusMiles);
      if (existingCoverage.selectedZips) setSelectedZips(existingCoverage.selectedZips);
      if (existingCoverage.excludedZips) setExcludedZips(existingCoverage.excludedZips);
    }
  }, [existingCoverage]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newCenter = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setCenter(newCenter);
        map?.panTo(newCenter);
        // Simulate zip detection around new center
        detectZips(newCenter, radius);
      }
    }
  };

  // Mock Zip detection logic
  // In a real app, this would call a geo-indexing service or fetch GeoJSON
  const detectZips = (location: { lat: number, lng: number }, radiusMiles: number) => {
    // Simulate detecting 5-8 random nearby zip codes for the prototype
    const mockZips = [
      Math.floor(60000 + Math.random() * 9999).toString(),
      Math.floor(60000 + Math.random() * 9999).toString(),
      Math.floor(60000 + Math.random() * 9999).toString(),
      Math.floor(60000 + Math.random() * 9999).toString(),
      Math.floor(60000 + Math.random() * 9999).toString(),
    ];
    setSelectedZips(prev => Array.from(new Set([...prev, ...mockZips])));
  };

  const toggleZipExclusion = (zip: string) => {
    setExcludedZips(prev => 
      prev.includes(zip) ? prev.filter(z => z !== zip) : [...prev, zip]
    );
  };

  const handleSave = async () => {
    if (!user || !db) return;
    setIsSaving(true);

    const geohash = geohashForLocation([center.lat, center.lng]);
    const coverageData = {
      providerId: user.uid,
      center,
      radiusMiles: radius,
      selectedZips,
      excludedZips,
      geohash,
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(db, 'provider_coverage', user.uid);
    setDoc(docRef, coverageData, { merge: true })
      .then(() => {
        toast({
          title: "Coverage Saved",
          description: "Your service area has been updated successfully.",
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: coverageData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSaving(false));
  };

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center">Loading Map...</div>;

  const activeZips = selectedZips.filter(z => !excludedZips.includes(z));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline tracking-tight">Service Coverage</h1>
          <p className="text-muted-foreground">Define where you're willing to work.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 h-12 rounded-2xl shadow-lg shadow-accent/20 font-bold"
        >
          {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Area</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <Locate className="w-5 h-5" /> Area Settings
              </CardTitle>
              <CardDescription>Enter a base location and set your radius.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Base Address / Zip</label>
                <Autocomplete
                  onLoad={onAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                >
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter city or zip code..." 
                      className="pl-10 h-12 bg-muted/20 border-none rounded-xl"
                    />
                  </div>
                </Autocomplete>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Radius</label>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3">{radius} Miles</Badge>
                </div>
                <Slider
                  defaultValue={[radius]}
                  max={50}
                  min={1}
                  step={1}
                  onValueChange={(val) => setRadius(val[0])}
                  className="py-4"
                />
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="w-3 h-3" /> Drag the slider to expand or shrink your reach.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" /> Coverage Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-muted/20 rounded-2xl">
                <div>
                  <p className="text-2xl font-bold text-primary">{activeZips.length}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Active Zip Codes</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">{excludedZips.length}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Excluded Areas</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Zip Code Management</label>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedZips.map((zip) => (
                      <div 
                        key={zip}
                        onClick={() => toggleZipExclusion(zip)}
                        className={`
                          p-2 rounded-xl text-xs font-bold flex justify-between items-center cursor-pointer transition-all border
                          ${excludedZips.includes(zip) 
                            ? 'bg-destructive/5 text-destructive border-destructive/20 line-through opacity-60' 
                            : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white'}
                        `}
                      >
                        <span>{zip}</span>
                        {excludedZips.includes(zip) ? <MapIcon className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                    ))}
                    {selectedZips.length === 0 && (
                      <p className="col-span-2 text-center text-muted-foreground text-xs py-10">No zip codes detected yet. Try changing your location or radius.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Display */}
        <div className="lg:col-span-2 h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-white">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={center}
            zoom={11}
            onLoad={onMapLoad}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [
                {
                  featureType: "all",
                  elementType: "geometry.fill",
                  stylers: [{ weight: "2.00" }]
                },
                {
                  featureType: "all",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#9c9c9c" }]
                }
              ]
            }}
          >
            <Marker position={center} />
            <Circle
              center={center}
              radius={radius * MILES_TO_METERS}
              options={{
                fillColor: '#42A4C2',
                fillOpacity: 0.1,
                strokeColor: '#42A4C2',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                clickable: false,
                editable: true,
                draggable: true,
              }}
              onDragEnd={(e) => {
                if (e.latLng) {
                  setCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
              }}
              onRadiusChanged={() => {
                // Handle radius change from map if needed
              }}
            />
          </GoogleMap>
          
          <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
            <Badge className="bg-white/90 backdrop-blur-md text-primary border-none px-4 py-2 shadow-lg pointer-events-auto flex gap-2 items-center">
              <MapIcon className="w-4 h-4" />
              Interactive Coverage Builder
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
