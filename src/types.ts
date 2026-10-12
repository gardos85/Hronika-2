/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EventLocation {
  name?: string;
  lat: number;
  lng: number;
}

export type ViewMode = "timeline" | "chronological" | "map";

export type MainSection = "hronika" | "svici" | "sveto-pismo" | "workspace";

export type NotionColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export interface TagConfig {
  id: string;
  name: string;
  color: NotionColor;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  group: string;
  startYear: number;
  startMonth?: number; // 1-12
  endYear?: number;   // present for Periods, undefined for Events
  endMonth?: number;   // 1-12
  color?: string;      // custom color hex
  tags: string[];
  isApproximate?: boolean; // prefix with "oko" (circa) if true
  endApproximate?: boolean; // prefix end year with "oko" if true
  image?: string;          // image URL or base64 data
  sourceUrl?: string;      // source website link
  location?: EventLocation;
  ruler?: string;          // Vladar
  capital?: string;        // Prestonica
  empire?: string;         // Svetska sila (za kategoriju Vladar)
  writer?: string;         // Pisac (za kategorije Sveto pismo i Ličnost)
  writingPlace?: string;   // Mesto pisanja (za kategoriju Sveto pismo)
  writingCompleted?: string; // Pisanje završeno (za kategoriju Sveto pismo)
  timeCovered?: string;    // Obuhvata period (za kategoriju Sveto pismo)
  place?: string;          // Mesto (za kategoriju Biblijski događaj)
  additionalRulers?: string[]; // Dodatni vladari (za svetske sile gde je vladalo više vladara)
  customFields?: Array<{ id: string; label: string; value: string }>; // Prilagođena polja
}

export interface GroupConfig {
  name: string;
  color: string;
  visible: boolean;
}

export interface TimelineFilter {
  searchQuery: string;
  selectedGroups: string[];
  selectedTag: string;
  fromYear: number;
  toYear: number;
}

export type FontFamilyType = 
  | "inter" 
  | "serif" 
  | "mono";

export type SkinType = 
  | "pro_studio"
  | "hronika";

export interface AppPreferences {
  theme: "dark" | "light";
  skin: SkinType;
  font?: FontFamilyType;
  adaptiveLogo?: boolean;
  showDataSourceTitles?: boolean;
  showVerticalLines?: boolean;
  showCardIcon?: boolean;
  openCardIn?: "side_peek" | "float";
  projectIcon?: string;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
}

export type UserPreferences = AppPreferences;
export type FilterOptions = TimelineFilter;
