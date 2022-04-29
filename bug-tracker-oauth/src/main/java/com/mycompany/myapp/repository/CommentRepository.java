package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Comment entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    @Query("select comment from Comment comment where comment.login.login = ?#{principal.preferredUsername}")
    List<Comment> findByLoginIsCurrentUser();
}
