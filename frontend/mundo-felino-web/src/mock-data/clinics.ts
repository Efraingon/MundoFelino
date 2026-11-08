/**
 * Datos simulados de clínicas veterinarias en Venezuela
 * Se usan cuando USE_MOCK_DATA=true y no hay backend disponible
 */

export interface Clinic {
  id: string;
  name: string;
  address: string;
  municipality: string;
  phone?: string;
  whatsapp?: string;
  emergencyAvailable: boolean;
  lastVerifiedAt?: string;
}

export const clinics: Clinic[] = [
  {
    id: "1",
    name: "Clínica Veterinaria Central de Caracas",
    address: "Av. Francisco de Miranda #456",
    municipality: "Chacao",
    phone: "(0212) 555-1234",
    whatsapp: "https://wa.me/584123456789",
    emergencyAvailable: true,
    lastVerifiedAt: "2026-10-15",
  },
  {
    id: "2",
    name: "Veterinaria Las Mercedes",
    address: "Calle 24 #23-56",
    municipality: "La Carolina",
    phone: "(0212) 555-2345",
    whatsapp: "",
    emergencyAvailable: false,
    lastVerifiedAt: "2026-09-20",
  },
  {
    id: "3",
    name: "Clínica Félina Simón Bolívar",
    address: "Av. Francisco de Miranda #890",
    municipality: "Chacao",
    phone: "(0212) 555-3456",
    whatsapp: "https://wa.me/584123789012",
    emergencyAvailable: true,
    lastVerifiedAt: "2026-10-20",
  },
  {
    id: "4",
    name: "Veterinaria Altamiro",
    address: "Urbanización Santa Ana #123",
    municipality: "Baruta",
    phone: "(0212) 555-4567",
    whatsapp: "",
    emergencyAvailable: false,
    lastVerifiedAt: "2026-10-10",
  },
  {
    id: "5",
    name: "Clínica Vet La Candelaria",
    address: "Calle Guaireña #78",
    municipality: "Chacarita",
    phone: "(0212) 555-6789",
    whatsapp: "https://wa.me/584123987654",
    emergencyAvailable: true,
    lastVerifiedAt: "2026-10-18",
  },
  {
    id: "6",
    name: "Veterinaria Pet Shop Centro",
    address: "Calle de Las Mercedes #234",
    municipality: "Las Mercedes",
    phone: "(0212) 555-7890",
    whatsapp: "",
    emergencyAvailable: false,
    lastVerifiedAt: "2026-09-25",
  },
];

/**
 * Función para obtener veterinarios con filtros de búsqueda
 */
export function getClinicsWithFilters(
  municipality?: string,
  emergencyOnly?: boolean
): Clinic[] {
  let result = [...clinics];
  
  // Filtro por municipio
  if (municipality && municipality.trim()) {
    const searchMunicipality = municipality.toLowerCase().trim();
    result = result.filter(c => 
      c.municipality.toLowerCase().includes(searchMunicipality)
    );
  }
  
  // Filtro solo urgencias
  if (emergencyOnly) {
    result = result.filter(c => c.emergencyAvailable);
  }
  
  return result;
}

/**
 * Función para obtener veterinario por ID
 */
export function getClinicById(id: string): Clinic | undefined {
  return clinics.find(c => c.id === id);
}