package com.taskforge.repository;

import com.taskforge.model.TokenDenylistEntry;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenDenylistRepository extends JpaRepository<TokenDenylistEntry, UUID> {

    boolean existsByTokenJti(String tokenJti);

    @Modifying
    @Query("DELETE FROM TokenDenylistEntry t WHERE t.expiresAt < :now")
    int deleteExpiredEntries(Instant now);
}
