package com.github.snimmagadda1.chatservice.service;

import jakarta.annotation.PostConstruct;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class KeycloakService {

  private Keycloak keycloak;

  @Value("${keycloak.server-url}")
  private String serverUrl;

  @Value("${keycloak.realm}")
  private String realm;

  @Value("${keycloak.client-id}")
  private String clientId;

  // @Value("${keycloak.client-secret}")
  // private String clientSecret;

  @Value("${keycloak.username}")
  private String username;

  @Value("${keycloak.password}")
  private String password;

  @PostConstruct
  public void init() {
    System.out.println("Constructing with value - " + serverUrl);
    this.keycloak =
        KeycloakBuilder.builder()
            .serverUrl(serverUrl)
            .realm(realm)
            .grantType(OAuth2Constants.PASSWORD)
            .clientId(clientId)
            .username(username)
            .password(password)
            .build();
  }

  public Keycloak getKeycloak() {
    return keycloak;
  }
}
