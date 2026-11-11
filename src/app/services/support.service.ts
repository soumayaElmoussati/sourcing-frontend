import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ticket.model.ts
export interface Ticket {
  id: number;
  ticketNumber: string;
  sellerId: number;
  sellerName: string;
  sellerEmail: string;
  storeName: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedToId?: number;
  assignedToName?: string;
  attachmentsPath?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  messageCount: number;
  recentMessages?: Message[];
}

export interface Message {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  senderRole: 'ADMIN' | 'SELLER';
  message: string;
  attachmentsPath?: string;
  adminReply: boolean;
  read: boolean;
  createdAt: string;
}

export interface TicketPageResponse {
  content: Ticket[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  highPriorityTickets: number;
  unreadMessages: number;
}

export interface TicketCreateRequest {
  subject: string;
  description: string;
  category: string;
  priority: string;
  attachment?: File;
}

export interface MessageRequest {
  message: string;
  attachment?: File;
}

export interface TicketStatusUpdate {
  status: string;
  resolution?: string;
}

export interface TicketAssignment {
  adminId: number;
  priority?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private apiUrl = `${environment.apiUrl}/api/admin/support`; 
  private sellerApiUrl = `${environment.apiUrl}/api/seller/support`; 

  constructor(private http: HttpClient) { }

  getAllTickets(page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets`, { params });
  }


  getTicketsByStatus(status: string, page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets/status/${status}`, { params });
  }

  getTicketsByPriority(priority: string, page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets/priority/${priority}`, { params });
  }


  getTicketsByCategory(category: string, page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets/category/${category}`, { params });
  }

  getTicketsAssignedToAdmin(adminId: number, page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets/assigned/${adminId}`, { params });
  }

  getTicketsBySeller(sellerId: number, page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.apiUrl}/tickets/seller/${sellerId}`, { params });
  }

  getTicketDetails(ticketId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/${ticketId}`);
  }

  assignTicket(ticketId: number, assignment: TicketAssignment): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets/${ticketId}/assign`, assignment);
  }

  updateTicketStatus(ticketId: number, statusUpdate: TicketStatusUpdate): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/tickets/${ticketId}/status`, statusUpdate);
  }

  addMessage(ticketId: number, message: string, attachment?: File): Observable<Message> {
    const formData = new FormData();
    
    const messageRequest = { message };
    formData.append('message', message);
    
    if (attachment) {
      formData.append('attachment', attachment, attachment.name);
    }

    return this.http.post<Message>(`${this.apiUrl}/tickets/${ticketId}/messages`, formData);
  }

  getStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.apiUrl}/stats`);
  }

  getMyTickets(page: number = 0, size: number = 10): Observable<TicketPageResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<TicketPageResponse>(`${this.sellerApiUrl}/tickets`, { params });
  }
  
  getMyStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.sellerApiUrl}/stats`);
  }

  createTicket(request: TicketCreateRequest): Observable<any> {
    const formData = new FormData();
    formData.append('subject', request.subject);
    formData.append('description', request.description);
    formData.append('category', request.category);
    formData.append('priority', request.priority);
    
    if (request.attachment) {
      formData.append('attachment', request.attachment, request.attachment.name);
    }

    return this.http.post(`${this.sellerApiUrl}/tickets`, formData);
  }

  getMyTicketDetails(ticketId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.sellerApiUrl}/tickets/${ticketId}`);
  }

  addMessageToMyTicket(ticketId: number, message: string, attachment?: File): Observable<Message> {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachment) {
      formData.append('attachment', attachment, attachment.name);
    }

    return this.http.post<Message>(`${this.sellerApiUrl}/tickets/${ticketId}/messages`, formData);
  }
}
