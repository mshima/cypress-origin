package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Ticket;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.hibernate.annotations.QueryHints;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class TicketRepositoryWithBagRelationshipsImpl implements TicketRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Ticket> fetchBagRelationships(Optional<Ticket> ticket) {
        return ticket.map(this::fetchLabels);
    }

    @Override
    public Page<Ticket> fetchBagRelationships(Page<Ticket> tickets) {
        return new PageImpl<>(fetchBagRelationships(tickets.getContent()), tickets.getPageable(), tickets.getTotalElements());
    }

    @Override
    public List<Ticket> fetchBagRelationships(List<Ticket> tickets) {
        return Optional.of(tickets).map(this::fetchLabels).orElse(Collections.emptyList());
    }

    Ticket fetchLabels(Ticket result) {
        return entityManager
            .createQuery("select ticket from Ticket ticket left join fetch ticket.labels where ticket is :ticket", Ticket.class)
            .setParameter("ticket", result)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getSingleResult();
    }

    List<Ticket> fetchLabels(List<Ticket> tickets) {
        return entityManager
            .createQuery("select distinct ticket from Ticket ticket left join fetch ticket.labels where ticket in :tickets", Ticket.class)
            .setParameter("tickets", tickets)
            .setHint(QueryHints.PASS_DISTINCT_THROUGH, false)
            .getResultList();
    }
}
