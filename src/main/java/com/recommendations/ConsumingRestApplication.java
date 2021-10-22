package com.recommendations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@SpringBootApplication
public class ConsumingRestApplication {

    private static final Logger log = LoggerFactory.getLogger(ConsumingRestApplication.class);

    @Value("${accuweather.forecastApiHost}")
    private String forecastApiHost;
    @Value("${accuweather.cityId}")
    private String cityId;
    @Value("${accuweather.apiKey}")
    private String apiKey;
    @Value("${accuweather.queryOptions}")
    private String queryOptions;

    public static void main(String[] args) {
        SpringApplication.run(ConsumingRestApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    public CommandLineRunner run(RestTemplate restTemplate) throws Exception {
        return args -> {
            ObjectMapper mapper = new ObjectMapper();
            TypeReference<List<Forecast>> mapType = new TypeReference<List<Forecast>>() {};
            String response = restTemplate.getForObject(
                    "http://"+forecastApiHost+"/forecasts/v1/hourly/12hour/"+cityId+"?apikey="+apiKey+queryOptions, String.class);
            List<Forecast> jsonToPersonList = mapper.readValue(response, mapType);
            log.info(jsonToPersonList.toString());
        };
    }
}
