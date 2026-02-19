'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { saveRegistrations, getRegistrations } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function InscriptionPage() {
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getRegistrations().then((slots) => {
            setSelectedSlots(slots);
            setIsLoading(false);
        });
    }, []);

    const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9); // 9 to 17

    const toggleSlot = (slot: number) => {
        if (selectedSlots.includes(slot)) {
            setSelectedSlots(selectedSlots.filter((s) => s !== slot));
        } else {
            if (selectedSlots.length < 3) {
                setSelectedSlots([...selectedSlots, slot]);
            } else {
                alert('You can select a maximum of 3 schedules.');
            }
        }
    };

    const handleSubmit = () => {
        startTransition(async () => {
            await saveRegistrations({ timeSlots: selectedSlots });
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            </div>
        );
    }

    return (
        <section className="flex flex-col items-center justify-center py-12">
            <div className="max-w-2xl w-full px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    School Inscription
                </h1>
                <p className="text-gray-600 mb-8 text-center">
                    Select up to 3 time slots for your inscription.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {timeSlots.map((slot) => {
                        const isSelected = selectedSlots.includes(slot);
                        return (
                            <Button
                                key={slot}
                                variant={isSelected ? 'default' : 'outline'}
                                className={`h-16 text-lg ${isSelected ? 'bg-orange-500 hover:bg-orange-600' : ''
                                    }`}
                                onClick={() => toggleSlot(slot)}
                            >
                                {slot}:00
                            </Button>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-black hover:bg-gray-800 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Confirm Inscription'
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}
