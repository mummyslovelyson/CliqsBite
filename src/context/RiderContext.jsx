import React, { createContext, useContext, useState, useCallback } from "react";

const RiderContext = createContext();

export const ACCRA_DELIVERY_ZONES = [
  "East Legon & Boundary Road",
  "Airport Residential & Dzorwulu",
  "Osu & Ring Road Central",
  "Spintex & Batsonaa",
  "Cantonments & Labone",
  "Dansoman & Korle Bu",
  "Tema Community 1-12",
  "Madina & Adenta Hub",
];

export function RiderProvider({ children }) {
  // Online/Offline status
  const [isOnline, setIsOnline] = useState(true);

  // Operating Delivery Zone
  const [operatingZone, setOperatingZone] = useState("East Legon & Boundary Road");

  // Application Draft for incomplete registrations
  const [applicationDraft, setApplicationDraft] = useState(null);

  // Rider Profile & Admin Approval Status
  // "approved" | "pending_verification" | "rejected"
  const [riderProfile, setRiderProfile] = useState({
    name: "Kwame Asante",
    phone: "+233 24 111 2233",
    email: "kwame.asante@cliqsbite.com",
    dob: "1996-08-14",
    residentialAddress: "House 14, Lagos Avenue, East Legon, Accra",
    operatingZone: "East Legon & Boundary Road",
    vehicleType: "Motorcycle",
    vehicleModel: "Honda Ace 125",
    plateNumber: "GW-8821-24",
    licenseNumber: "DL-GH-890214",
    ghanaCard: "GHA-718293041-9",
    emergencyContactName: "Akosua Asante (Spouse)",
    emergencyContactPhone: "+233 20 888 9900",
    payoutMethod: "MTN Mobile Money",
    payoutAccount: "024 111 2233",
    isApproved: true,
    verificationStatus: "approved", // "approved" | "pending_verification" | "rejected"
    approvalNotes: "All documents verified by CliqsBite Operations Admin.",
    rating: 5.0,
    totalReviews: 0,
    acceptanceRate: 100,
    completionRate: 100,
  });

  // Current active delivery job (null when idle)
  const [activeDelivery, setActiveDelivery] = useState(null);

  // Available delivery requests broadcasted to nearby riders (starts clean)
  const [availableRequests, setAvailableRequests] = useState([]);

  // Completed delivery history
  const [deliveryHistory, setDeliveryHistory] = useState([]);

  // Support & Incident Reports
  const [supportTickets, setSupportTickets] = useState([]);

  // Earnings & Financial Ledger
  const [earnings, setEarnings] = useState({
    today: 0.0,
    week: 0.0,
    month: 0.0,
    tips: 0.0,
    basePay: 0.0,
    distancePay: 0.0,
  });

  /**
   * Toggle Online / Offline status with approval check
   */
  const toggleOnline = useCallback(() => {
    if (riderProfile.verificationStatus !== "approved") {
      return {
        success: false,
        message: "You cannot go online until your rider application is approved by an administrator.",
      };
    }
    setIsOnline((prev) => !prev);
    return { success: true };
  }, [riderProfile.verificationStatus]);

  /**
   * Accept an available delivery request atomically
   */
  const acceptDelivery = useCallback((order) => {
    const job = {
      ...order,
      step: 1, // 1: Heading to Kitchen, 2: Arrived at Kitchen, 3: Order Picked Up, 4: In Transit to Customer, 5: Arrived at Customer, 6: Delivered
      status: "Heading to Kitchen",
      pickupAddress: "CliqsBite Kitchen Hub - Lagos Avenue, Opp. A&C Mall, East Legon",
      pickupInstructions: "Park at bike bay #3. Collect insulated thermal bag from dispatch counter #2. Verify seal barcode.",
      pickupCode: "PK-882",
      customerOtp: "5824", // 4-digit drop-off verification code
      acceptedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      payout: 18.5,
      tip: 0.0,
      reportedDelays: [],
    };

    setActiveDelivery(job);
    setAvailableRequests((prev) => prev.filter((r) => r.id !== order.id));
  }, []);

  /**
   * Decline an available delivery request with mandatory reason tracking
   */
  const rejectDelivery = useCallback((orderId, reason = "Rider passed") => {
    setAvailableRequests((prev) => prev.filter((r) => r.id !== orderId));
    // Log refusal for dispatch balancing
    return { success: true, reason };
  }, []);

  /**
   * Advance delivery lifecycle milestone step
   */
  const advanceDeliveryStep = useCallback(() => {
    setActiveDelivery((prev) => {
      if (!prev) return null;
      const nextStep = prev.step + 1;
      let nextStatus = prev.status;

      if (nextStep === 2) nextStatus = "Arrived at Kitchen";
      else if (nextStep === 3) nextStatus = "Order Picked Up • Thermal Bag Sealed";
      else if (nextStep === 4) nextStatus = "In Transit to Customer";
      else if (nextStep === 5) nextStatus = "Arrived at Customer Doorstep";

      return {
        ...prev,
        step: nextStep,
        status: nextStatus,
      };
    });
  }, []);

  /**
   * Report restaurant preparation delay or issues during pickup
   */
  const reportDeliveryException = useCallback((issueType, notes = "") => {
    if (!activeDelivery) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const incident = { type: issueType, notes, time };

    setActiveDelivery((prev) => ({
      ...prev,
      reportedDelays: [...(prev.reportedDelays || []), incident],
    }));

    setSupportTickets((prev) => [
      {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: activeDelivery.id,
        issueType,
        notes,
        status: "Logged with Dispatch",
        timestamp: time,
      },
      ...prev,
    ]);
  }, [activeDelivery]);

  /**
   * Confirm delivery via Customer 4-digit OTP & proof of delivery
   */
  const completeDelivery = useCallback((enteredOtp, proofPhotoUri) => {
    if (!activeDelivery) return { success: false, message: "No active delivery" };

    if (enteredOtp !== activeDelivery.customerOtp) {
      return {
        success: false,
        message: "Invalid OTP code. Please ask the customer for the 4-digit verification code shown on their tracking screen.",
      };
    }

    const completedJob = {
      ...activeDelivery,
      step: 6,
      status: "Delivered",
      completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      proofPhoto: proofPhotoUri || null,
      otpVerified: true,
    };

    // Update history
    setDeliveryHistory((prev) => [completedJob, ...prev]);

    // Credit financial earnings
    setEarnings((prev) => ({
      today: prev.today + completedJob.payout,
      week: prev.week + completedJob.payout,
      month: prev.month + completedJob.payout,
      tips: prev.tips + completedJob.tip,
      basePay: prev.basePay + 12.0,
      distancePay: prev.distancePay + (completedJob.payout - 12.0),
    }));

    setActiveDelivery(null);
    return { success: true, message: "Delivery completed successfully! Payout credited to your earnings." };
  }, [activeDelivery]);

  /**
   * Cancel active delivery in case of emergency
   */
  const cancelActiveDelivery = useCallback((reason) => {
    if (!activeDelivery) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSupportTickets((prev) => [
      {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: activeDelivery.id,
        issueType: "Delivery Cancelled by Rider",
        notes: reason,
        status: "Urgent Review Required",
        timestamp: time,
      },
      ...prev,
    ]);
    setActiveDelivery(null);
  }, [activeDelivery]);

  /**
   * Update rider profile details
   */
  const updateProfile = useCallback((updates) => {
    setRiderProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Submit or update rider registration
   */
  const submitRiderApplication = useCallback((formData) => {
    setRiderProfile((prev) => ({
      ...prev,
      ...formData,
      isApproved: false,
      verificationStatus: "pending_verification",
      approvalNotes: "Application submitted. Under review by CliqsBite Operations Admin.",
    }));
    setApplicationDraft(null);
    setIsOnline(false); // cannot go online until approved
  }, []);

  /**
   * Toggle admin approval status (for administrative testing & verification flow)
   */
  const setAdminApprovalStatus = useCallback((status) => {
    setRiderProfile((prev) => ({
      ...prev,
      isApproved: status === "approved",
      verificationStatus: status,
      approvalNotes:
        status === "approved"
          ? "All documents approved by CliqsBite Operations Admin."
          : status === "rejected"
          ? "Ghana Card image was blurry. Please resubmit."
          : "Application submitted and waiting for background check.",
    }));
    if (status !== "approved") {
      setIsOnline(false);
    }
  }, []);

  return (
    <RiderContext.Provider
      value={{
        isOnline,
        toggleOnline,
        operatingZone,
        setOperatingZone,
        riderProfile,
        updateProfile,
        submitRiderApplication,
        applicationDraft,
        setApplicationDraft,
        setAdminApprovalStatus,
        activeDelivery,
        setActiveDelivery,
        availableRequests,
        setAvailableRequests,
        acceptDelivery,
        rejectDelivery,
        advanceDeliveryStep,
        reportDeliveryException,
        completeDelivery,
        cancelActiveDelivery,
        deliveryHistory,
        earnings,
        supportTickets,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
}

export function useRider() {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error("useRider must be used within a RiderProvider");
  }
  return context;
}
