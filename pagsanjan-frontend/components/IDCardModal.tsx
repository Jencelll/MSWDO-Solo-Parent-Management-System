import React, { useState, useRef, useEffect } from 'react';
import { CircleX, Printer, Upload, Camera, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, X, Loader2, Save, CheckCircle, ExternalLink } from 'lucide-react';
import cardFront from '../assets/solo_parent.jpg';
import cardBack from '../assets/back.jpg';
import { API_CONFIG } from '../config';

interface IDCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  isAdmin?: boolean;
  onPrintComplete?: () => void;
}

const IDCardModal: React.FC<IDCardModalProps> = ({ isOpen, onClose, data, isAdmin = false, onPrintComplete }) => {
  console.log("IDCardModal Render:", { isOpen, data });

  const DEFAULT_POSITIONS = {
    // Front positions - Scaled for 103x64mm
    name: { x: 38.6, y: 32.3 },
    category: { x: 59.7, y: 38.0 },
    benefit: { x: 66.2, y: 43.4 },
    idNo: { x: 11.1, y: 52.0 },
    valid: { x: 16.5, y: 56.3 },
    photo: { x: 3.7, y: 24.1 },      // Aligned with white box (1x1 inch centered)
    
    // Back side positions
    backAddress: { x: 23.9, y: 4.8 },
    backDob: { x: 26, y: 8 },
    backPob: { x: 55, y: 8 },
    
    emName: { x: 14.7, y: 14.5 },
    emAddress: { x: 17, y: 17.5 },
    emRel: { x: 17.5, y: 20.5 },
    emContact: { x: 60, y: 20 },
    
    // Children Row 1 - Table Alignment
    c1Name: { x: 7.3, y: 28.6 }, c1Dob: { x: 56.7, y: 29 }, c1Rel: { x: 75, y: 28.6 },
    // Children Row 2
    c2Name: { x: 7.3, y: 32.3 }, c2Dob: { x: 56.7, y: 32.3 }, c2Rel: { x: 75, y: 32.3 },
    // Children Row 3
    c3Name: { x: 7.3, y: 36.1 }, c3Dob: { x: 56.7, y: 36.1 }, c3Rel: { x: 75, y: 36.1 },
    // Children Row 4
    c4Name: { x: 7.3, y: 39.5 }, c4Dob: { x:56.7, y: 39.5 }, c4Rel: { x: 75, y: 39 },
    // Children Row 5
    c5Name: { x: 7.3, y: 43 }, c5Dob: { x:56.7, y: 43 }, c5Rel: { x: 75, y: 43 }
  };

  const [fieldPositions, setFieldPositions] = useState<Record<string, { x: number, y: number }>>(DEFAULT_POSITIONS);

  // Only allow dragging in admin mode (if prop provided)
    const isEditable = true; // TEMPORARY: Allow everyone to drag to fix alignment 

  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPan, setPhotoPan] = useState({ x: 0, y: 0 });
  const [showBack, setShowBack] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoFit, setPhotoFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [isPhotoLocked, setIsPhotoLocked] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing photo when modal opens
  useEffect(() => {
    if (data) {
      // Prioritize application-specific photo, fallback to applicant registry photo
      const existingPhoto = data.photo_path || data.applicant?.photo_path;
      if (existingPhoto) {
        // If API_CONFIG.BASE_URL is set (e.g. production), prepend it. 
        // Otherwise, if it's empty (dev with proxy), relative path works fine.
        // Ensure we don't double-slash if BASE_URL ends with / and path starts with /
        const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
        const path = existingPhoto.startsWith('/') ? existingPhoto : `/${existingPhoto}`;
        
        const photoUrl = existingPhoto.startsWith('http') 
          ? existingPhoto 
          : `${baseUrl}${path}`;
          
        setPhoto(photoUrl);
      } else {
        setPhoto(null); // Reset if no photo
      }
    }
  }, [data]);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Constants for scaling (Initial values, will be updated by ResizeObserver)
  const CARD_WIDTH_MM = 103; // 103 mm
  const CARD_HEIGHT_MM = 64; // 64 mm
  
  const [scaleMetrics, setScaleMetrics] = useState({
    x: 500 / CARD_WIDTH_MM,
    y: 315 / CARD_HEIGHT_MM
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setScaleMetrics({
          x: width / CARD_WIDTH_MM,
          y: height / CARD_HEIGHT_MM
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [CARD_WIDTH_MM, CARD_HEIGHT_MM]); // Added dependencies to re-calculate on size change

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (field: string, e: React.MouseEvent) => {
    if (!isEditable) return;
    if (field === 'photo' && isPhotoLocked) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate offset from the element's top-left corner
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedField(field);
    setSelectedField(field);
  };

  const handleTouchStart = (field: string, e: React.TouchEvent) => {
    if (!isEditable) return;
    if (field === 'photo' && isPhotoLocked) return;
    e.stopPropagation();
    
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedField(field);
    setSelectedField(field);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedField && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate new position relative to container, subtracting the initial offset
      // This ensures the element follows the mouse exactly where it was grabbed
      let x = (e.clientX - rect.left - dragOffset.x) / scaleMetrics.x;
      let y = (e.clientY - rect.top - dragOffset.y) / scaleMetrics.y;
      
      // Edge Detection / Constraints
      // Keep within card boundaries (0,0 to 103,64)
      x = Math.max(0, Math.min(x, CARD_WIDTH_MM));
      y = Math.max(0, Math.min(y, CARD_HEIGHT_MM));

      setFieldPositions(prev => ({
        ...prev,
        [draggedField]: { x, y }
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedField && containerRef.current) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      
      let x = (touch.clientX - rect.left - dragOffset.x) / scaleMetrics.x;
      let y = (touch.clientY - rect.top - dragOffset.y) / scaleMetrics.y;
      
      // Edge Detection / Constraints
      x = Math.max(0, Math.min(x, CARD_WIDTH_MM));
      y = Math.max(0, Math.min(y, CARD_HEIGHT_MM));
      
      setFieldPositions(prev => ({
        ...prev,
        [draggedField]: { x, y }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedField(null);
  };

  // Handle outside click to stop dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggedField) setDraggedField(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [draggedField]);

  // Cleanup camera on unmount or close
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Ensure camera stops when modal closes (since component might not unmount)
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  // Safety check for data
  if (!data) {
    console.warn("IDCardModal: No data provided", data);
    return null;
  }

  // Support both flat data (from IDCardManagement) and nested data (standard)
  const applicant = data.applicant || data;
  
  if (!applicant || (!applicant.first_name && !data.name)) {
    console.warn("IDCardModal: Missing applicant data", { data, applicant });
    return null;
  }

  const fullName = applicant.first_name 
    ? `${applicant.first_name || ''} ${applicant.middle_name ? applicant.middle_name[0] + '.' : ''} ${applicant.last_name || ''}`.toUpperCase()
    : (data.name || '').toUpperCase();

  const address = applicant.barangay 
    ? `${applicant.barangay || ''}, PAGSANJAN, LAGUNA`.toUpperCase()
    : (data.address || '').toUpperCase();

  // Helper to extract emergency contact details from multiple possible structures
  const getEmergencyContact = () => {
    // 1. Check if it's in the standard applicant structure
    const contacts = applicant.emergency_contacts || applicant.emergencyContacts;
    if (contacts && contacts.length > 0) {
      const ec = contacts[0];
      return {
        name: ec.full_name || ec.name || 'N/A',
        address: ec.address || 'N/A',
        relationship: ec.relationship || 'N/A',
        number: ec.contact_number || ec.number || 'N/A'
      };
    }
    
    // 2. Check if it's in the data.emergencyContact structure (flat)
    if (data.emergencyContact) {
      return {
        name: data.emergencyContact.name || data.emergencyContact.full_name || 'N/A',
        address: data.emergencyContact.address || 'N/A',
        relationship: data.emergencyContact.relationship || 'N/A',
        number: data.emergencyContact.number || data.emergencyContact.contact_number || 'N/A'
      };
    }

    // 3. Check for top-level emergency fields (sometimes found in flat API responses)
    if (data.emergency_name || data.emergency_contact_name) {
        return {
            name: data.emergency_name || data.emergency_contact_name || 'N/A',
            address: data.emergency_address || 'N/A',
            relationship: data.emergency_relationship || 'N/A',
            number: data.emergency_number || data.emergency_contact_number || 'N/A'
        };
    }

    return { name: 'N/A', address: 'N/A', relationship: 'N/A', number: 'N/A' };
  };

  const emergencyContact = getEmergencyContact();

  // Helper to get family members from multiple possible structures
  const getFamilyMembers = () => {
    const members = applicant.family_members || applicant.familyMembers || [];
    return members.map((m: any) => ({
        ...m,
        full_name: m.full_name || m.name || 'N/A',
        dob: m.dob || m.date_of_birth || m.birthDate || null,
        relationship: m.relationship || 'N/A'
    }));
  };

  const familyMembers = getFamilyMembers();

  // Safe Date parsing
  const formatDate = (dateString: any) => {
    try {
      if (!dateString) return 'N/A';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateNoDay = (dateString: any) => {
    try {
      if (!dateString) return 'N/A';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'N/A';
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Safe Age calculation
  const calculateAge = (dob: any) => {
    try {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return 'N/A';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        return 'N/A';
    }
  };
  const age = calculateAge(applicant?.dob || data?.birthDate);
  
  const uploadPhotoToBackend = async (photoDataUrl: string) => {
    const applicantId = applicant?.id || data?.id;
    if (!applicantId) return;
    
    setIsUploading(true);
    try {
      // Convert DataURL to Blob
      const arr = photoDataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      
      const formData = new FormData();
      formData.append('photo', blob, 'photo.jpg');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/applicants/${applicantId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      console.log('Photo uploaded successfully');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to save photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetPhoto = () => {
    setFieldPositions(prev => ({ ...prev, photo: DEFAULT_POSITIONS.photo }));
    setPhotoZoom(1);
    setPhotoPan({ x: 0, y: 0 });
    setPhotoFit('cover');
    setIsPhotoLocked(false); // Unlock position for manual adjustment if needed
  };

  const handleSaveProfile = () => {
    if (photo) {
        uploadPhotoToBackend(photo);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhoto(result);
        uploadPhotoToBackend(result); // Immediate persist on upload
        resetPhoto(); // Auto-reset on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      setIsCameraLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          // Relaxed constraints for stability - let browser/driver decide best match within range
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          facingMode: "user"
          // Removed frameRate constraint to avoid driver stress in low light
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ensure video plays once ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraLoading(false);
          videoRef.current?.play().catch(e => console.error("Play error:", e));
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      setIsFlashing(true);
      
      // Small delay to show flash before stopping camera
      setTimeout(() => {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) {
            setIsFlashing(false);
            return;
        }

        const canvas = document.createElement('canvas');
        
        // Determine the size of the square crop (min of width/height)
        // This matches the object-cover behavior on a square container
        const size = Math.min(video.videoWidth, video.videoHeight);
        
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Calculate source x and y to crop from center
          const sx = (video.videoWidth - size) / 2;
          const sy = (video.videoHeight - size) / 2;
          
          console.log('Capture Dimensions:', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            cropSize: size,
            sx, sy
          });

          // Mirror the capture to match the preview (WYSIWYG)
          ctx.translate(size, 0);
          ctx.scale(-1, 1);

          // Draw the cropped image to canvas
          ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // High quality
          setPhoto(dataUrl);
          uploadPhotoToBackend(dataUrl); // Immediate persist on capture
          
          // Reset photo positioning to default when new photo is taken
          resetPhoto();

          stopCamera();
        }
        setIsFlashing(false);
      }, 150);
    }
  };

  const handleManualPrint = () => {
    try {
      console.log('Starting manual print in new tab...');
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for this website to print manually.');
        return;
      }

      // Filter family members
      const filteredFamilyMembers = (familyMembers || []).filter((member: any) => {
        const isPwd = member.is_pwd || member.isPwd === 'Yes' || member.isPwd === true;
        const memberAge = member.age !== undefined ? member.age : calculateAge(member.dob);
        if (isPwd) return true;
        if (typeof memberAge === 'string' && memberAge === 'N/A') return true; 
        return Number(memberAge) < 23;
      });

      // Absolute URLs
      const getAbsoluteUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('data:')) return path;
        if (path.startsWith('http')) return path;
        return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
      };

      const frontUrl = getAbsoluteUrl(cardFront);
      const backUrl = getAbsoluteUrl(cardBack);
      const photoUrl = photo ? getAbsoluteUrl(photo) : '';

      const sanitizedFilename = fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toUpperCase();

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${sanitizedFilename}_SOLO_PARENT_ID</title>
            <style>
              @page { size: portrait; margin: 0mm; }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: Arial, sans-serif; 
                display: flex; 
                flex-direction: row; 
                justify-content: center; 
                align-items: flex-start; 
                background-color: white;
                gap: 0;
              }
              .no-print {
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                background: white;
                padding: 10px 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .card-container {
                width: 103mm;
                height: 64mm;
                position: relative;
                overflow: hidden;
                border: 0.1mm solid #ddd;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                margin: 0;
                background-color: white;
                flex-shrink: 0;
                page-break-inside: avoid;
              }
              .card-bg {
                width: 100%;
                height: 100%;
                object-fit: fill;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 0;
              }
              .content {
                position: relative;
                z-index: 10;
                width: 100%;
                height: 100%;
              }
              .photo-box {
                position: absolute;
                left: ${fieldPositions.photo.x}mm;
                top: ${fieldPositions.photo.y}mm;
                width: 25.4mm; /* Exact 1x1 inch */
                height: 25.4mm;
                overflow: hidden;
              }
              .photo-box img {
                width: 100%;
                height: 100%;
                object-fit: ${photoFit};
                transform: scale(${photoZoom}) translate(${photoPan.x}%, ${photoPan.y}%);
                transform-origin: center;
              }
              .text-field {
                position: absolute;
                font-family: 'Arial Black', sans-serif;
                font-weight: 900;
                color: #000;
                text-transform: uppercase;
                line-height: 1.1;
                white-space: nowrap;
                overflow: hidden;
                pointer-events: none;
              }
              /* Dynamic positions */
              .name { top: ${fieldPositions.name.y}mm; left: ${fieldPositions.name.x}mm; font-size: 8pt; width: 66.2mm; }
              .category { top: ${fieldPositions.category.y}mm; left: ${fieldPositions.category.x}mm; font-size: 6pt; width: 66.2mm; }
              .benefit { top: ${fieldPositions.benefit.y}mm; left: ${fieldPositions.benefit.x}mm; font-size: 6pt; width: 66.2mm; }
              .id-no { top: ${fieldPositions.idNo.y}mm; left: ${fieldPositions.idNo.x}mm; font-size: 9pt; color: #000; font-family: 'Arial Black'; }
              .valid { top: ${fieldPositions.valid.y}mm; left: ${fieldPositions.valid.x}mm; font-size: 6pt; }
              
              .back-address { top: ${fieldPositions.backAddress.y}mm; left: ${fieldPositions.backAddress.x}mm; font-size: 6pt; width: 71.7mm; }
              .back-dob { top: ${fieldPositions.backDob.y}mm; left: ${fieldPositions.backDob.x}mm; font-size: 6pt; width: 35.8mm; }
              .back-pob { top: ${fieldPositions.backPob.y}mm; left: ${fieldPositions.backPob.x}mm; font-size: 6pt; width: 50.0mm; }
              
              .em-name { top: ${fieldPositions.emName.y}mm; left: ${fieldPositions.emName.x}mm; font-size: 6pt; width: 71.7mm; }
              .em-address { top: ${fieldPositions.emAddress.y}mm; left: ${fieldPositions.emAddress.x}mm; font-size: 6pt; width: 71.7mm; }
              .em-rel { top: ${fieldPositions.emRel.y}mm; left: ${fieldPositions.emRel.x}mm; font-size: 6pt; width: 35.8mm; }
              .em-contact { top: ${fieldPositions.emContact.y}mm; left: ${fieldPositions.emContact.x}mm; font-size: 6pt; width: 18.4mm; }

              .child-row { font-size: 6pt; text-transform: uppercase; position: absolute; white-space: nowrap; }
              .c1-name { top: ${fieldPositions.c1Name.y}mm; left: ${fieldPositions.c1Name.x}mm; width: 46.0mm; }
              .c1-dob { top: ${fieldPositions.c1Dob.y}mm; left: ${fieldPositions.c1Dob.x}mm; width: 22.1mm; text-align: center; }
              .c1-rel { top: ${fieldPositions.c1Rel.y}mm; left: ${fieldPositions.c1Rel.x}mm; width: 22.1mm; text-align: center; }

              .c2-name { top: ${fieldPositions.c2Name.y}mm; left: ${fieldPositions.c2Name.x}mm; width: 46.0mm; }
              .c2-dob { top: ${fieldPositions.c2Dob.y}mm; left: ${fieldPositions.c2Dob.x}mm; width: 22.1mm; text-align: center; }
              .c2-rel { top: ${fieldPositions.c2Rel.y}mm; left: ${fieldPositions.c2Rel.x}mm; width: 22.1mm; text-align: center; }

              .c3-name { top: ${fieldPositions.c3Name.y}mm; left: ${fieldPositions.c3Name.x}mm; width: 46.0mm; }
              .c3-dob { top: ${fieldPositions.c3Dob.y}mm; left: ${fieldPositions.c3Dob.x}mm; width: 22.1mm; text-align: center; }
              .c3-rel { top: ${fieldPositions.c3Rel.y}mm; left: ${fieldPositions.c3Rel.x}mm; width: 22.1mm; text-align: center; }

              .c4-name { top: ${fieldPositions.c4Name.y}mm; left: ${fieldPositions.c4Name.x}mm; width: 46.0mm; }
              .c4-dob { top: ${fieldPositions.c4Dob.y}mm; left: ${fieldPositions.c4Dob.x}mm; width: 22.1mm; text-align: center; }
              .c4-rel { top: ${fieldPositions.c4Rel.y}mm; left: ${fieldPositions.c4Rel.x}mm; width: 22.1mm; text-align: center; }

              .c5-name { top: ${fieldPositions.c5Name.y}mm; left: ${fieldPositions.c5Name.x}mm; width: 46.0mm; }
              .c5-dob { top: ${fieldPositions.c5Dob.y}mm; left: ${fieldPositions.c5Dob.x}mm; width: 22.1mm; text-align: center; }
              .c5-rel { top: ${fieldPositions.c5Rel.y}mm; left: ${fieldPositions.c5Rel.x}mm; width: 22.1mm; text-align: center; }

              @media print {
                body { background-color: white; padding: 0; }
                .no-print { display: none; }
                .card-container { border: 0.1mm solid #ddd; margin: 0; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button onclick="window.print()" style="padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">PRINT NOW</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-left: 10px;">CLOSE</button>
            </div>

            <!-- Front Card -->
            <div class="card-container">
              <img src="${frontUrl}" class="card-bg" onload="checkImages()" />
              <div class="content">
                <div class="photo-box">
                  ${photoUrl ? `<img src="${photoUrl}" />` : ''}
                </div>
                <div class="text-field name">${fullName}</div>
                <div class="text-field category">${data.category_code || 'N/A'}</div>
                <div class="text-field benefit">${data.benefit_code ? data.benefit_code.split(',').join(' / ') : 'N/A'}</div>
                <div class="text-field id-no">${data.idNumber || data.id_number || '0000'}</div>
                <div class="text-field valid">${formatDateNoDay(data.validUntil || data.expiration_date)}</div>
              </div>
            </div>

            <!-- Back Card -->
            <div class="card-container">
              <img src="${backUrl}" class="card-bg" onload="checkImages()" />
              <div class="content">
                <div class="text-field back-address">${address}</div>
                <div class="text-field back-dob">${formatDate(applicant.dob || data.birthDate)}</div>
                <div class="text-field back-pob">${applicant.place_of_birth || 'N/A'}</div>

                <div class="text-field em-name">${emergencyContact.name}</div>
                <div class="text-field em-address">${emergencyContact.address}</div>
                <div class="text-field em-rel">${emergencyContact.relationship}</div>
                <div class="text-field em-contact">${emergencyContact.number}</div>

                <!-- Children Rows -->
                ${(filteredFamilyMembers || []).slice(0, 5).map((child: any, i: number) => `
                  <div class="text-field child-row c${i+1}-name">${child.full_name || child.name || ''}</div>
                  <div class="text-field child-row c${i+1}-dob">${child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}</div>
                  <div class="text-field child-row c${i+1}-rel">${child.relationship || ''}</div>
                `).join('')}
              </div>
            </div>

            <script>
              var loadedCount = 0;
              function checkImages() {
                loadedCount++;
                if (loadedCount >= 2) {
                  setTimeout(() => window.print(), 500);
                }
              }
              // Fallback
              setTimeout(() => {
                if (loadedCount < 2) window.print();
              }, 2000);
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      if (onPrintComplete) {
        onPrintComplete();
      }

    } catch (e) {
      console.error('Manual print failed:', e);
      alert('Failed to open manual print window.');
    }
  };

  const handlePrint = () => {
    try {
      console.log('Starting print process...');

      // Filter family members for the back of the card
      const filteredFamilyMembers = (familyMembers || []).filter((member: any) => {
        const isPwd = member.is_pwd || member.isPwd === 'Yes' || member.isPwd === true;
        const memberAge = member.age !== undefined ? member.age : calculateAge(member.dob);
        
        if (isPwd) return true;
        if (typeof memberAge === 'string' && memberAge === 'N/A') return true; 
        return Number(memberAge) < 23;
      });

      // Ensure we have absolute URLs for images
      const getAbsoluteUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('data:')) return path;
        if (path.startsWith('http')) return path;
        return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
      };

      const frontUrl = getAbsoluteUrl(cardFront);
      const backUrl = getAbsoluteUrl(cardBack);
      const photoUrl = photo ? getAbsoluteUrl(photo) : '';

      console.log('Image URLs prepared:', { frontUrl, backUrl, photoUrl });

      // Sanitize filename
      const sanitizedFilename = fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toUpperCase();
      
      // Create hidden iframe
      let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
      if (iframe) {
          document.body.removeChild(iframe);
      }
      
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px'; // Move off-screen instead of hidden
      iframe.style.top = '-9999px';
      iframe.style.width = '103mm';
      iframe.style.height = '200mm'; // Enough for both sides
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (!doc) {
        console.error('Failed to access iframe document');
        alert('Browser security prevented printing. Please try a different browser.');
        document.body.removeChild(iframe);
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${sanitizedFilename}_SOLO_PARENT_ID</title>
            <style>
              @page { size: portrait; margin: 0mm; }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: Arial, sans-serif; 
                display: flex; 
                flex-direction: row; 
                justify-content: center; 
                align-items: flex-start; 
                background-color: white;
                gap: 0;
              }
              .card-container {
                width: 103mm;
                height: 64mm;
                position: relative;
                overflow: hidden;
                border: 0.1mm solid #ddd;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                margin: 0;
                flex-shrink: 0;
                page-break-inside: avoid;
              }
              .card-bg {
                width: 100%;
                height: 100%;
                object-fit: fill;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 0;
              }
              .content {
                position: relative;
                z-index: 10;
                width: 100%;
                height: 100%;
              }
              .photo-box {
                position: absolute;
                left: ${fieldPositions.photo.x}mm;
                top: ${fieldPositions.photo.y}mm;
                width: 25.4mm; /* Exact 1x1 inch */
                height: 25.4mm;
                overflow: hidden;
              }
              .photo-box img {
                width: 100%;
                height: 100%;
                object-fit: ${photoFit};
                transform: scale(${photoZoom}) translate(${photoPan.x}%, ${photoPan.y}%);
                transform-origin: center;
              }
              .text-field {
                position: absolute;
                font-family: 'Arial Black', sans-serif;
                font-weight: 900;
                color: #000;
                text-transform: uppercase;
                line-height: 1.1;
                white-space: nowrap;
                overflow: hidden;
                pointer-events: none;
              }
              /* Dynamic positions injected from state */
              .name { top: ${fieldPositions.name.y}mm; left: ${fieldPositions.name.x}mm; font-size: 8pt; width: 66.2mm; }
              .category { top: ${fieldPositions.category.y}mm; left: ${fieldPositions.category.x}mm; font-size: 6pt; width: 66.2mm; }
              .benefit { top: ${fieldPositions.benefit.y}mm; left: ${fieldPositions.benefit.x}mm; font-size: 6pt; width: 66.2mm; }
              .id-no { top: ${fieldPositions.idNo.y}mm; left: ${fieldPositions.idNo.x}mm; font-size: 9pt; color: #000; font-family: 'Arial Black'; }
              .valid { top: ${fieldPositions.valid.y}mm; left: ${fieldPositions.valid.x}mm; font-size: 6pt; }
              
              /* Back Card Styles */
              .back-address { top: ${fieldPositions.backAddress.y}mm; left: ${fieldPositions.backAddress.x}mm; font-size: 6pt; width: 71.7mm; }
              .back-dob { top: ${fieldPositions.backDob.y}mm; left: ${fieldPositions.backDob.x}mm; font-size: 6pt; width: 35.8mm; }
              .back-pob { top: ${fieldPositions.backPob.y}mm; left: ${fieldPositions.backPob.x}mm; font-size: 6pt; width: 50.0mm; }
              
              .em-name { top: ${fieldPositions.emName.y}mm; left: ${fieldPositions.emName.x}mm; font-size: 6pt; width: 71.7mm; }
              .em-address { top: ${fieldPositions.emAddress.y}mm; left: ${fieldPositions.emAddress.x}mm; font-size: 6pt; width: 71.7mm; }
              .em-rel { top: ${fieldPositions.emRel.y}mm; left: ${fieldPositions.emRel.x}mm; font-size: 6pt; width: 35.8mm; }
              .em-contact { top: ${fieldPositions.emContact.y}mm; left: ${fieldPositions.emContact.x}mm; font-size: 6pt; width: 18.4mm; }

              /* Children Table Styles */
              .child-row { font-size: 6pt; text-transform: uppercase; position: absolute; white-space: nowrap; }
              .c1-name { top: ${fieldPositions.c1Name.y}mm; left: ${fieldPositions.c1Name.x}mm; width: 46.0mm; }
              .c1-dob { top: ${fieldPositions.c1Dob.y}mm; left: ${fieldPositions.c1Dob.x}mm; width: 22.1mm; text-align: center; }
              .c1-rel { top: ${fieldPositions.c1Rel.y}mm; left: ${fieldPositions.c1Rel.x}mm; width: 22.1mm; text-align: center; }

              .c2-name { top: ${fieldPositions.c2Name.y}mm; left: ${fieldPositions.c2Name.x}mm; width: 46.0mm; }
              .c2-dob { top: ${fieldPositions.c2Dob.y}mm; left: ${fieldPositions.c2Dob.x}mm; width: 22.1mm; text-align: center; }
              .c2-rel { top: ${fieldPositions.c2Rel.y}mm; left: ${fieldPositions.c2Rel.x}mm; width: 22.1mm; text-align: center; }

              .c3-name { top: ${fieldPositions.c3Name.y}mm; left: ${fieldPositions.c3Name.x}mm; width: 46.0mm; }
              .c3-dob { top: ${fieldPositions.c3Dob.y}mm; left: ${fieldPositions.c3Dob.x}mm; width: 22.1mm; text-align: center; }
              .c3-rel { top: ${fieldPositions.c3Rel.y}mm; left: ${fieldPositions.c3Rel.x}mm; width: 22.1mm; text-align: center; }

              .c4-name { top: ${fieldPositions.c4Name.y}mm; left: ${fieldPositions.c4Name.x}mm; width: 46.0mm; }
              .c4-dob { top: ${fieldPositions.c4Dob.y}mm; left: ${fieldPositions.c4Dob.x}mm; width: 22.1mm; text-align: center; }
              .c4-rel { top: ${fieldPositions.c4Rel.y}mm; left: ${fieldPositions.c4Rel.x}mm; width: 22.1mm; text-align: center; }

              .c5-name { top: ${fieldPositions.c5Name.y}mm; left: ${fieldPositions.c5Name.x}mm; width: 46.0mm; }
              .c5-dob { top: ${fieldPositions.c5Dob.y}mm; left: ${fieldPositions.c5Dob.x} width: 22.1mm; text-align: center; }
              .c5-rel { top: ${fieldPositions.c5Rel.y}mm; left: ${fieldPositions.c5Rel.x}mm; width: 22.1mm; text-align: center; }

              @media print {
                body { background-color: white; padding: 0; }
                .card-container { border: 0.1mm solid #ddd; margin: 0; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <!-- Front Card -->
            <div class="card-container">
              <img src="${frontUrl}" class="card-bg" onload="parent.checkImages()" onerror="parent.imageError(this)" />
              <div class="content">
                <div class="photo-box">
                  ${photoUrl ? `<img src="${photoUrl}" />` : ''}
                </div>
                <div class="text-field name">${fullName}</div>
                <div class="text-field category">${data.category_code || 'N/A'}</div>
                <div class="text-field benefit">${data.benefit_code ? data.benefit_code.split(',').join(' / ') : 'N/A'}</div>
                <div class="text-field id-no">${data.idNumber || data.id_number || '0000'}</div>
                <div class="text-field valid">${formatDateNoDay(data.validUntil || data.expiration_date)}</div>
              </div>
            </div>

            <!-- Back Card -->
            <div class="card-container">
              <img src="${backUrl}" class="card-bg" onload="parent.checkImages()" onerror="parent.imageError(this)" />
              <div class="content">
                <div class="text-field back-address">${address}</div>
                <div class="text-field back-dob">${formatDate(applicant.dob || data.birthDate)}</div>
                <div class="text-field back-pob">${applicant.place_of_birth || 'N/A'}</div>

                <div class="text-field em-name">${emergencyContact.name}</div>
                <div class="text-field em-address">${emergencyContact.address}</div>
                <div class="text-field em-rel">${emergencyContact.relationship}</div>
                <div class="text-field em-contact">${emergencyContact.number}</div>

                <!-- Children Rows -->
                ${(filteredFamilyMembers || []).slice(0, 5).map((child: any, i: number) => `
                  <div class="text-field child-row c${i+1}-name">${child.full_name || child.name || ''}</div>
                  <div class="text-field child-row c${i+1}-dob">${child.dob ? new Date(child.dob).toLocaleDateString() : 'N/A'}</div>
                  <div class="text-field child-row c${i+1}-rel">${child.relationship || ''}</div>
                `).join('')}
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Define helper functions on the parent window for the iframe to call
      (window as any).imagesLoaded = 0;
      (window as any).totalImages = 2;
      (window as any).checkImages = function() {
        (window as any).imagesLoaded++;
        console.log(`Image loaded: ${(window as any).imagesLoaded}/${(window as any).totalImages}`);
        if ((window as any).imagesLoaded >= (window as any).totalImages) {
          console.log('All images loaded, triggering print...');
          setTimeout(() => {
            const printIframe = document.getElementById('print-iframe') as HTMLIFrameElement;
            if (printIframe && printIframe.contentWindow) {
              printIframe.contentWindow.focus();
              printIframe.contentWindow.print();
              
              // Notify parent that printing was triggered
              if (onPrintComplete) {
                onPrintComplete();
              }
            }
          }, 500);
        }
      };
      (window as any).imageError = function(img: any) {
        console.error('Failed to load image in print iframe:', img.src);
      };

      doc.open();
      doc.write(htmlContent);
      doc.close();

      console.log('Iframe content written, waiting for images...');

      // Fallback timeout in case images fail
      setTimeout(() => {
        const printIframe = document.getElementById('print-iframe') as HTMLIFrameElement;
        if (printIframe && printIframe.contentWindow && (window as any).imagesLoaded < (window as any).totalImages) {
          console.log('Fallback print trigger (timeout reached)...');
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        }
      }, 3000);

    } catch (e) {
      console.error('Print failed:', e);
      alert('Failed to initialize printing. Please check your browser settings.');
    }
  };

  // Nudge Controls
  const nudgeField = (axis: 'x' | 'y', amount: number) => {
    if (!selectedField) return;
    setFieldPositions(prev => ({
        ...prev,
        [selectedField]: {
            ...prev[selectedField],
            [axis]: Number((prev[selectedField][axis] + amount).toFixed(1))
        }
    }));
  };

  // Helper to render draggable field
  const renderDraggableField = (
    key: string, 
    content: string, 
    style: React.CSSProperties = {}
  ) => {
    const pos = fieldPositions[key];
    if (!pos) return null; // Safety check
    
    const isDragging = draggedField === key;
    const isSelected = selectedField === key;
    
    return (
      <div 
        onMouseDown={(e) => handleMouseDown(key, e)}
        onTouchStart={(e) => handleTouchStart(key, e)}
        style={{
          position: 'absolute',
          left: `${pos.x * scaleMetrics.x}px`,
          top: `${pos.y * scaleMetrics.y}px`,
          cursor: isEditable ? 'move' : 'default',
          zIndex: isDragging || isSelected ? 50 : 20,
          border: isDragging ? '1px dashed #7c3aed' : isSelected ? '1px solid #7c3aed' : '1px dashed transparent',
          backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
          whiteSpace: 'nowrap',
          ...style
        }}
        className={`text-slate-900 font-bold uppercase leading-tight select-none transition-colors ${isDragging ? 'bg-white/50' : ''} ${isEditable ? 'hover:border-violet-400' : ''}`}
        title={isEditable ? "Drag to reposition" : undefined}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full ${isAdmin ? 'max-w-5xl grid grid-cols-1 lg:grid-cols-12' : 'max-w-2xl flex flex-col'} overflow-hidden h-auto max-h-[90vh]`}>
        
        {/* Left Panel - Admin Controls */}
        {isAdmin && (
           <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 border-r border-slate-100 dark:border-slate-700 flex flex-col overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Camera size={20} className="text-violet-600" />
                <span>Photo Options</span>
              </h3>
              
              <div className="space-y-6">
                 {/* Upload Section */}
                 <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Photo</label>
                    <div className="flex items-center gap-3">
                       <label className="w-full cursor-pointer bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                          <Upload size={18} className="text-slate-500 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Choose File</span>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                       </label>
                    </div>
                 </div>

                 <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                 </div>

                 {/* Camera Section */}
                 <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Webcam</label>
                    
                    {isCameraOpen ? (
                       <div className="space-y-3">
                          <div className="rounded-xl overflow-hidden bg-black aspect-square relative shadow-inner flex items-center justify-center group">
                             {isCameraLoading && (
                               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-white gap-2">
                                 <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                 <span className="text-xs font-bold uppercase tracking-wider">Initializing Camera...</span>
                               </div>
                             )}
                             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                             
                             {/* Flash Effect */}
                             {isFlashing && (
                                <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none"></div>
                             )}

                             {/* 1x1 Guide Overlay */}
                             {!isCameraLoading && (
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-full h-full border-2 border-white/50 relative overflow-hidden">
                                        {/* Corners */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-500 rounded-tl-lg"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-500 rounded-tr-lg"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-500 rounded-bl-lg"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-500 rounded-br-lg"></div>
                                        
                                        {/* Head/Shoulder Silhouette Guide */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                            <svg viewBox="0 0 200 200" className="w-2/3 h-2/3 text-white fill-none stroke-current stroke-2">
                                                <path d="M100,110 C125,110 145,90 145,65 C145,40 125,20 100,20 C75,20 55,40 55,65 C55,90 75,110 100,110 Z" />
                                                <path d="M40,180 C40,140 70,120 100,120 C130,120 160,140 160,180" />
                                            </svg>
                                        </div>

                                        {/* Center Crosshair (Optional) */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                            <div className="w-4 h-0.5 bg-white"></div>
                                            <div className="h-4 w-0.5 bg-white absolute"></div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-bold">
                                        PHOTO GUIDE
                                    </div>
                                </div>
                             )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <button onClick={capturePhoto} disabled={isCameraLoading} className="bg-violet-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Capture</button>
                             <button onClick={stopCamera} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300 transition-all">Cancel</button>
                          </div>
                       </div>
                    ) : (
                       <button onClick={startCamera} className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20">
                          <Camera size={18} />
                          <span>Open Camera</span>
                       </button>
                    )}
                 </div>
                 
                 {/* Photo Adjustment Section */}
                 {photo && (
                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                Adjust Photo
                            </label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={isUploading}
                                    className={`text-xs flex items-center gap-1 font-bold px-2 py-1 rounded transition-colors ${saveSuccess ? 'bg-green-100 text-green-700' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                                >
                                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    {saveSuccess ? 'Saved!' : 'Save Profile'}
                                </button>
                                <button 
                                    onClick={resetPhoto}
                                    className="text-xs text-violet-600 font-bold hover:underline"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div className="text-xs text-slate-500 font-mono col-span-2">
                                 Position: X={fieldPositions.photo.x.toFixed(1)}, Y={fieldPositions.photo.y.toFixed(1)}
                             </div>
                             
                             {/* Position Presets */}
                             <div className="col-span-2 flex gap-2">
                                <button onClick={() => setFieldPositions(prev => ({...prev, photo: DEFAULT_POSITIONS.photo}))} className="px-2 py-1 bg-violet-100 text-violet-700 text-[10px] font-bold rounded hover:bg-violet-200 border border-violet-200">Auto Align (Default)</button>
                                <button onClick={() => setIsPhotoLocked(!isPhotoLocked)} className={`px-2 py-1 text-[10px] font-bold rounded border ${isPhotoLocked ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                    {isPhotoLocked ? 'Unlock Position' : 'Lock Position'}
                                </button>
                             </div>

                             {/* Fit Modes */}
                             <div className="col-span-2 flex gap-1 mt-2 p-1 bg-slate-100 rounded-lg">
                                {['cover', 'contain', 'fill'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPhotoFit(mode as any)}
                                        className={`flex-1 py-1 text-[10px] font-bold rounded uppercase transition-all ${photoFit === mode ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Zoom</span>
                                    <span>{Math.round(photoZoom * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.1" 
                                    value={photoZoom} 
                                    onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Pan X</span>
                                        <span>{photoPan.x}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-50" 
                                        max="50" 
                                        step="1" 
                                        value={photoPan.x} 
                                        onChange={(e) => setPhotoPan(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Pan Y</span>
                                        <span>{photoPan.y}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-50" 
                                        max="50" 
                                        step="1" 
                                        value={photoPan.y} 
                                        onChange={(e) => setPhotoPan(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                 )}

                 <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                       <strong>Tip:</strong> You can drag the text fields on the card preview to adjust their alignment perfectly before printing.
                    </p>
                 </div>
              </div>
           </div>
        )}
        
        {/* Right Panel: Preview - Full Width or Col Span */}
        <div className={`${isAdmin ? 'lg:col-span-8' : 'w-full'} p-8 bg-slate-50 dark:bg-black/20 overflow-y-auto flex flex-col items-center relative justify-center min-h-[300px] md:min-h-[500px]`}>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm z-50"
          >
            <CircleX size={24} />
          </button>

          <div className="mb-6 text-center">
             <h2 className="text-lg font-bold text-slate-800">Your Solo Parent ID</h2>
             <p className="text-xs text-slate-500 uppercase">Official Digital Copy</p>
          </div>

          <div className="flex items-center space-x-2 mb-6 bg-white rounded-full p-1 shadow-sm border border-slate-200">
             <button onClick={() => setShowBack(false)} className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${!showBack ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>FRONT</button>
             <button onClick={() => setShowBack(true)} className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${showBack ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>BACK</button>
          </div>

          {/* Card Preview Container */}
          <div className="relative w-full flex flex-col items-center">
            {/* Fine Tune Controls - Mobile Friendly */}
            {selectedField && (
                <div className="absolute top-[-60px] z-50 flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-1">{selectedField}</span>
                    <div className="flex gap-1">
                        <button onClick={() => nudgeField('x', -0.5)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"><ArrowLeft size={14} /></button>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => nudgeField('y', -0.5)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"><ArrowUp size={14} /></button>
                            <button onClick={() => nudgeField('y', 0.5)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"><ArrowDown size={14} /></button>
                        </div>
                        <button onClick={() => nudgeField('x', 0.5)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"><ArrowRight size={14} /></button>
                    </div>
                    <button onClick={() => setSelectedField(null)} className="ml-2 p-1 text-slate-400 hover:text-slate-600"><X size={14} /></button>
                </div>
            )}

          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative shadow-xl rounded-xl overflow-hidden bg-white select-none transition-transform hover:scale-[1.01] w-full max-w-[500px] aspect-[107.9/66.7]"
          >
            
            {/* Front Side */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <img src={cardFront} className="w-full h-full object-fill" alt="Card Front" draggable={false} />
              
              {/* Photo Box Draggable */}
              {photo && (
                <div 
                  onMouseDown={(e) => handleMouseDown('photo', e)}
                  onTouchStart={(e) => handleTouchStart('photo', e)}
                  style={{
                    position: 'absolute',
                    left: `${fieldPositions.photo.x * scaleMetrics.x}px`,
                    top: `${fieldPositions.photo.y * scaleMetrics.y}px`,
                    width: `${25.4 * scaleMetrics.x}px`, 
                    height: `${25.4 * scaleMetrics.y}px`, 
                    cursor: 'move',
                    zIndex: draggedField === 'photo' ? 50 : 20,
                    border: draggedField === 'photo' ? '1px dashed #7c3aed' : 'none',
                  }}
                  className="overflow-hidden shadow-sm"
                >
                  <img 
                    src={photo} 
                    className="w-full h-full transition-transform" 
                    draggable={false} 
                    style={{
                      objectFit: photoFit,
                      transform: `scale(${photoZoom}) translate(${photoPan.x}%, ${photoPan.y}%)`,
                      transformOrigin: 'center'
                    }}
                  />
                </div>
              )}

              {renderDraggableField('name', fullName, { fontSize: `${13 * (scaleMetrics.x / (500/103))}px`, width: `${66.2 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('category', data.category_code || 'N/A', { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${66.2 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('benefit', data.benefit_code ? data.benefit_code.split(',').join(' / ') : 'N/A', { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${66.2 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('idNo', data.idNumber || data.id_number || '0000', { fontSize: `${14 * (scaleMetrics.x / (500/103))}px`, color: '#000', fontFamily: 'Arial Black, sans-serif', fontWeight: '900' })}
              {renderDraggableField('valid', formatDateNoDay(data.validUntil || data.expiration_date), { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
            </div>

            {/* Back Side */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${!showBack ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <img src={cardBack} className="w-full h-full object-fill" alt="Card Back" draggable={false} />
              
              {renderDraggableField('backAddress', address, { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${71.7 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('backDob', formatDate(applicant?.dob || data?.birthDate), { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${35.8 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('backPob', applicant?.place_of_birth || 'N/A', { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${50.0 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}

              {renderDraggableField('emName', emergencyContact.name, { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${71.7 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('emAddress', emergencyContact.address, { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${71.7 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('emRel', emergencyContact.relationship, { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${35.8 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
              {renderDraggableField('emContact', emergencyContact.number, { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${18.4 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}

              {/* Children Table Rows - Draggable */}
              {(familyMembers || []).slice(0, 5).map((child: any, i: number) => (
                <React.Fragment key={i}>
                  {renderDraggableField(`c${i+1}Name`, child.full_name || child.name || '', { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${46.0 * scaleMetrics.x}px`, fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
                  {renderDraggableField(`c${i+1}Dob`, formatDate(child.dob), { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${22.1 * scaleMetrics.x}px`, textAlign: 'center', fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
                  {renderDraggableField(`c${i+1}Rel`, child.relationship || '', { fontSize: `${9 * (scaleMetrics.x / (500/103))}px`, width: `${22.1 * scaleMetrics.x}px`, textAlign: 'center', fontWeight: '900', fontFamily: 'Arial Black, sans-serif' })}
                </React.Fragment>
              ))}
            </div>

          </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button 
                onClick={handlePrint}
                className="px-8 py-3 bg-violet-600 text-white rounded-lg font-bold flex items-center space-x-2 hover:bg-violet-700 transition-colors shadow-lg"
              >
                <Printer size={18} />
                <span>Quick Print</span>
            </button>

            <button 
                onClick={handleManualPrint}
                className="px-8 py-3 bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-2 hover:bg-slate-900 transition-colors shadow-lg"
              >
                <ExternalLink size={18} />
                <span>Print in New Tab (Fallback)</span>
            </button>

            {onPrintComplete && (
              <button 
                  onClick={() => {
                    onPrintComplete();
                  }}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold flex items-center space-x-2 hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <CheckCircle size={18} />
                  <span>Mark as Printed</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardModal;
