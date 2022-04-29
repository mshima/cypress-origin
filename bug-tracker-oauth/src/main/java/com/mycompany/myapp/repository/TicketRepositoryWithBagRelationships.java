package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Ticket;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface TicketRepositoryWithBagRelationships {
    Optional<Ticket> fetchBagRelationships(Optional<Ticket> ticket);

    List<Ticket> fetchBagRelationships(List<Ticket> tickets);

    Page<Ticket> fetchBagRelationships(Page<Ticket> tickets);
}
