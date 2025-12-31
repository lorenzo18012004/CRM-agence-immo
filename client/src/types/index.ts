export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'AGENT' | 'MANAGER' | 'SECRETARY';
  avatar?: string;
  isActive: boolean;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  type: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'VILLA' | 'STUDIO';
  status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING' | 'WITHDRAWN';
  address: string;
  city: string;
  postalCode: string;
  country: string;
  price: number;
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  hasElevator: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  yearBuilt?: number;
  energyClass?: string;
  co2Emission?: number;
  reference: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  client?: Client;
  photos?: PropertyPhoto[];
  contracts?: Contract[];
  documents?: Document[];
}

export interface PropertyPhoto {
  id: string;
  url: string;
  filename: string;
  isMain: boolean;
  order: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  type: 'SALE' | 'RENTAL';
  startDate: string;
  endDate?: string;
  price: number;
  commission?: number;
  commissionRate?: number;
  status: string;
  notes?: string;
  signedDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  property?: Property;
  client?: Client;
  documents?: Document[];
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  clientType: 'BUYER' | 'SELLER' | 'TENANT' | 'LANDLORD' | 'PROSPECT';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  properties?: Property[];
  contracts?: Contract[];
  appointments?: Appointment[];
  documents?: Document[];
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  type: 'CONTRACT' | 'INVOICE' | 'PHOTO' | 'IDENTITY' | 'PROPERTY_DOC' | 'OTHER';
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  property?: Property;
  contract?: Contract;
  client?: Client;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  client?: Client;
  property?: Property;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CMSPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencySettings {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  description?: string;
  siret?: string;
}

