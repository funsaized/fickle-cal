package com.github.snimmagadda1.chatservice;

import java.security.Principal;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class FeinedServiceApplication {

  @RequestMapping("/user")
  public Principal user(Principal user) {
    return user;
  }

  @GetMapping("/public")
  public String homePage() {
    return "Hello from Spring boot app";
  }

  public static void main(String[] args) {
    SpringApplication.run(FeinedServiceApplication.class, args);
  }
}
