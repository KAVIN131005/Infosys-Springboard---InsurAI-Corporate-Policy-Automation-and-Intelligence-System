package com.example.insur.dto;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String password;

    public UserDto() {}

    public UserDto(Long id, String username, String email, String role, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
     public void setRole(String role) {
        this.role = role;
    }

       public String getRole() {
        return role;
    }
      public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

  

}
