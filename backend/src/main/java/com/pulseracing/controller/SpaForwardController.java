package com.pulseracing.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({
            "/",
            "/{path:^(?!api$|actuator$)[^\\.]*}",
            "/{path:^(?!api$|actuator$)[^\\.]*}/**"
    })
    public String forwardApplicationRoutes() {
        return "forward:/index.html";
    }
}
