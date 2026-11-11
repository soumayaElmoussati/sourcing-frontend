import { Sector } from "./sector";

export interface Label {
    idLP?: number;
    titre?: string;
    abrev?: string;
    description?: string;
    colorBg?: String;
    secteurFk?:Sector; 
}

