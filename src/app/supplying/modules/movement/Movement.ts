import { Article } from '../article/Article';

export interface Movement
{
    id:number;
    comment: string;
    correlative: number;
    created_at: Date;
    date: Date;
    destination_id: number;
    origin_id: number;
    destination_name: string;
    origin_name: string;
    
    
    is_authorized: boolean;
    is_service: boolean;

    detail_article: Article[];
    state_movement_historical: any[];
    transactions:any[];
    movement_state: any;
    movement_type: any;
    user:any;
}