import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Plane, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

const SINGAPORE_TZ = 'Asia/Singapore';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FlightBoard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flights, setFlights] = useState([]);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showWhatsAppNotification, setShowWhatsAppNotification] = useState(false);
  const [updatedFlightId, setUpdatedFlightId] = useState(null);
  
  // Auto wake-up backend on component mount
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await axios.get(`${API}/`, { timeout: 5000 });
        console.log('Backend is awake');
      } catch (error) {
        console.log('Backend wake-up call made:', error.message);
      }
    };
    
    // Initial wake-up
    wakeUpBackend();
    
    // Keep-alive: Ping backend every 5 minutes to prevent sleep
    const keepAliveInterval = setInterval(() => {
      wakeUpBackend();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(keepAliveInterval);
  }, []);
  
  // Function to send WhatsApp message
  const sendWhatsAppMessage = async (flight) => {
    try {
      const response = await axios.post(`${API}/send-whatsapp`, {
        to_number: flight.phoneNumber,
        claim_number: flight.claimNumber,
        amount: flight.claimPaidAmount,
        flight_number: flight.flightNumber,
        traveller_name: flight.travellers
      });
      
      console.log('WhatsApp message sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return null;
    }
  };

  // Initialize flight data
  useEffect(() => {
    const now = new Date();
    
    const initialFlights = [
      {
        id: 1,
        policyNumber: 'TRV-2026-001487',
        travellers: 'Jolene Chua',
        phoneNumber: '+6598741945',
        flightNumber: 'SQ656',
        route: 'SIN → HAK',
        flightStatus: 'Delayed',
        expectedDepartureTime: now,
        actualDepartureTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // +6 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 2,
        policyNumber: 'TRV-2026-004392',
        travellers: 'Amirul Rahman',
        phoneNumber: '+6591234567',
        flightNumber: 'BG498',
        route: 'SIN → DAC',
        flightStatus: 'Delayed',
        expectedDepartureTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // -1 hour
        actualDepartureTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // +5 hours
        claimNumber: 'CLM-TRV-2026-008420',
        claimStatus: 'Paid',
        claimPaidAmount: '$100'
      },
      {
        id: 3,
        policyNumber: 'TRV-2026-010234',
        travellers: 'Siti Aishah',
        flightNumber: 'PK312',
        route: 'SIN → KHI',
        flightStatus: 'On Time',
        expectedDepartureTime: '28:45',
        actualDepartureTime: '28:45',
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 4,
        policyNumber: 'TRV-2026-009001',
        travellers: 'Darren Ong',
        flightNumber: 'SQ308',
        route: 'SIN → MLE',
        flightStatus: 'Cancelled',
        expectedDepartureTime: '17:05',
        actualDepartureTime: 'N/A',
        claimNumber: 'CLM-TRV-2026-008424',
        claimStatus: 'Paid',
        claimPaidAmount: '$150'
      },
      {
        id: 5,
        policyNumber: 'TRV-2026-012145',
        travellers: 'Wei Ming Tan',
        flightNumber: 'SQ878',
        route: 'SIN → BKK',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 hours
        actualDepartureTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 6,
        policyNumber: 'TRV-2026-013567',
        travellers: 'Maya Lim',
        flightNumber: 'TR385',
        route: 'SIN → TPE',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 3.5 * 60 * 60 * 1000), // +3.5 hours
        actualDepartureTime: new Date(now.getTime() + 3.5 * 60 * 60 * 1000), // +3.5 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 7,
        policyNumber: 'TRV-2026-014892',
        travellers: 'Raj Kumar',
        flightNumber: 'AI346',
        route: 'SIN → DEL',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), // +1.5 hours
        actualDepartureTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), // +1.5 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 8,
        policyNumber: 'TRV-2026-015234',
        travellers: 'Sarah Chen',
        flightNumber: 'CX715',
        route: 'SIN → HKG',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // +4 hours
        actualDepartureTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // +4 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 9,
        policyNumber: 'TRV-2026-016789',
        travellers: 'Ahmad Yusof',
        flightNumber: 'QR944',
        route: 'SIN → DOH',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // +5 hours
        actualDepartureTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // +5 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      },
      {
        id: 10,
        policyNumber: 'TRV-2026-017456',
        travellers: 'Jessica Wong',
        flightNumber: 'EK354',
        route: 'SIN → DXB',
        flightStatus: 'On Time',
        expectedDepartureTime: new Date(now.getTime() + 6.5 * 60 * 60 * 1000), // +6.5 hours
        actualDepartureTime: new Date(now.getTime() + 6.5 * 60 * 60 * 1000), // +6.5 hours
        claimNumber: '-',
        claimStatus: '-',
        claimPaidAmount: '-'
      }
    ];

    setFlights(initialFlights);

    // Set up timer for SQ656 claim after 30 seconds
    const timer = setTimeout(async () => {
      // Update the flight with claim information
      const updatedFlight = {
        claimNumber: 'CLM-TRV-2026-008431',
        claimStatus: 'Paid',
        claimPaidAmount: '$100'
      };

      setFlights(prev => prev.map(flight => {
        if (flight.flightNumber === 'SQ656') {
          setUpdatedFlightId(flight.id); // Highlight this row
          return {
            ...flight,
            ...updatedFlight
          };
        }
        return flight;
      }));

      // Find the SQ656 flight to send WhatsApp message
      const sq656Flight = initialFlights.find(f => f.flightNumber === 'SQ656');
      if (sq656Flight) {
        // Send actual WhatsApp message via API
        await sendWhatsAppMessage({
          ...sq656Flight,
          ...updatedFlight
        });
      }

      // Show WhatsApp notification popup
      setShowWhatsAppNotification(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    if (typeof time === 'string') return time;
    if (time instanceof Date) {
      return formatInTimeZone(time, SINGAPORE_TZ, 'HH:mm');
    }
    return '-';
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'On Time':
        return 'bg-green-100 text-black hover:bg-green-100';
      case 'Delayed':
        return 'bg-yellow-100 text-black hover:bg-yellow-100';
      case 'Cancelled':
        return 'bg-red-100 text-black hover:bg-red-100';
      default:
        return 'bg-gray-100 text-black hover:bg-gray-100';
    }
  };

  const handleClaimClick = (flight) => {
    if (flight.claimNumber !== '-') {
      setSelectedClaim({
        claimNumber: flight.claimNumber,
        amount: flight.claimPaidAmount,
        status: flight.claimStatus,
        flightNumber: flight.flightNumber
      });
      setShowClaimDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Income Logo */}
          <img 
            src="https://customer-assets.emergentagent.com/job_delay-dashboard/artifacts/hxowuzrq_image.png" 
            alt="Income Logo"
            className="h-10"
            data-testid="income-logo"
          />
          
          {/* Separator Line */}
          <div className="h-12 w-px bg-white/30"></div>
          
          {/* Plane Icon and Text */}
          <div className="flex items-center gap-3">
            <Plane className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold leading-tight">Claim Command Center</h1>
              <p className="text-orange-100 text-sm leading-tight">Real-time triggers for travel insurance claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Information Board */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Flight Information Board</h2>
              <p className="text-slate-300 text-sm">Real-time flight status and departure times</p>
            </div>
            <div className="bg-slate-700 px-6 py-4 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                <Clock className="w-4 h-4" />
                <span>Singapore Time (SGT)</span>
              </div>
              <div className="text-slate-400 text-xs mb-1">
                {formatInTimeZone(currentTime, SINGAPORE_TZ, 'EEE, dd MMM yyyy')}
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {formatInTimeZone(currentTime, SINGAPORE_TZ, 'HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-policy-number">Policy Number</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-travellers">Travellers</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[100px]" data-testid="header-flight-number">Flight Number</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[100px]" data-testid="header-route">Route</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[100px]" data-testid="header-flight-status">Flight Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-expected-departure">Expected Departure Time</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-actual-departure">Actual Departure Time</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[140px]" data-testid="header-claim-number">Claim Number</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-claim-status">Claim Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 whitespace-normal min-w-[120px]" data-testid="header-claim-paid-amount">Claim Paid Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights.map((flight) => (
                  <TableRow 
                    key={flight.id} 
                    className={`hover:bg-gray-50 transition-colors ${flight.id === updatedFlightId ? 'bg-orange-50' : ''}`}
                    data-testid={`flight-row-${flight.flightNumber}`}
                  >
                    <TableCell className="font-bold text-orange-600" data-testid={`policy-${flight.flightNumber}`}>{flight.policyNumber}</TableCell>
                    <TableCell className="font-semibold text-black" data-testid={`travellers-${flight.flightNumber}`}>{flight.travellers}</TableCell>
                    <TableCell className="font-bold text-black" data-testid={`flight-number-${flight.flightNumber}`}>{flight.flightNumber}</TableCell>
                    <TableCell className="font-semibold text-black" data-testid={`route-${flight.flightNumber}`}>{flight.route}</TableCell>
                    <TableCell data-testid={`status-${flight.flightNumber}`}>
                      <Badge className={getStatusBadgeColor(flight.flightStatus)}>
                        {flight.flightStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold text-black" data-testid={`expected-time-${flight.flightNumber}`}>{formatTime(flight.expectedDepartureTime)}</TableCell>
                    <TableCell className="tabular-nums font-semibold text-black" data-testid={`actual-time-${flight.flightNumber}`}>{formatTime(flight.actualDepartureTime)}</TableCell>
                    <TableCell data-testid={`claim-number-${flight.flightNumber}`}>
                      {flight.claimNumber !== '-' ? (
                        <button
                          onClick={() => handleClaimClick(flight)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
                          data-testid={`claim-link-${flight.flightNumber}`}
                        >
                          {flight.claimNumber}
                        </button>
                      ) : (
                        <span className="text-gray-400 font-semibold">-</span>
                      )}
                    </TableCell>
                    <TableCell data-testid={`claim-status-${flight.flightNumber}`}>
                      {flight.claimStatus !== '-' ? (
                        <Badge style={{ backgroundColor: '#9DC183' }} className="text-black hover:bg-[#9DC183] font-bold border-0">
                          {flight.claimStatus}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 font-semibold">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold" data-testid={`claim-amount-${flight.flightNumber}`}>
                      {flight.claimPaidAmount !== '-' ? (
                        <span className="text-green-600">{flight.claimPaidAmount}</span>
                      ) : (
                        <span className="text-gray-400 font-semibold">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <p className="text-sm text-gray-500 flex items-center justify-end gap-2">
            <span className="font-bold text-gray-800">⚡</span>
            Made in Bolt
          </p>
        </div>
      </div>

      {/* Claim Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent data-testid="claim-dialog">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Claim Number</p>
                <p className="text-lg font-semibold" data-testid="dialog-claim-number">{selectedClaim.claimNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Flight Number</p>
                <p className="text-lg font-semibold">{selectedClaim.flightNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge style={{ backgroundColor: '#9DC183' }} className="text-black hover:bg-[#9DC183] border-0">
                  {selectedClaim.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">{selectedClaim.amount}</p>
              </div>
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                <img 
                  src="https://customer-assets.emergentagent.com/job_1418e2e7-6f08-4c5c-9213-60ede4b4b425/artifacts/61pe78cb_image.png" 
                  alt="Jiffy Jane"
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <div className="font-semibold text-sm mb-1">Jiffy Jane</div>
                  <div className="text-sm text-gray-600">A new claim of {selectedClaim.amount} has successfully been paid.</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Notification Popup */}
      {showWhatsAppNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" data-testid="whatsapp-notification-overlay">
          <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full mx-4 relative" data-testid="whatsapp-notification">
            {/* Close Button */}
            <button 
              onClick={() => setShowWhatsAppNotification(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg leading-none"
              data-testid="close-notification-btn"
            >
              ✕
            </button>
            
            <div className="flex items-start gap-4 mb-4 pr-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_1418e2e7-6f08-4c5c-9213-60ede4b4b425/artifacts/61pe78cb_image.png" 
                alt="Jiffy Jane"
                className="w-14 h-14 rounded-lg flex-shrink-0"
              />
              <div className="flex-1 pt-1">
                <div className="font-bold text-base mb-2 text-gray-900">Jiffy Jane</div>
                <div className="text-sm text-gray-700 leading-relaxed">A new claim of $100 has successfully been paid.</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                Made with Emergent
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightBoard;