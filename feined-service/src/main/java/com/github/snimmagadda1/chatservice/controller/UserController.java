package com.github.snimmagadda1.chatservice.controller;

import com.github.snimmagadda1.chatservice.model.AppConstants;
import com.github.snimmagadda1.chatservice.service.KeycloakService;
import java.util.List;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

  private KeycloakService keycloakService;

  public UserController(KeycloakService keycloakService) {
    this.keycloakService = keycloakService;
  }

  @GetMapping("/users")
  public List<UserRepresentation> getUsers() {
    List<UserRepresentation> users =
        keycloakService.getKeycloak().realm(AppConstants.CHAT_APP_REALM).users().list();
    users.forEach(
        user -> {
          user.setRealmRoles(getRoles(user.getId()));
        });

    return users;
  }

  private List<String> getRoles(String userId) {
    return keycloakService
        .getKeycloak()
        .realm(AppConstants.CHAT_APP_REALM)
        .users()
        .get(userId)
        .roles()
        .realmLevel()
        .listEffective()
        .stream()
        .map(RoleRepresentation::getName)
        .toList();
  }
}
