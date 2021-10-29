package com.recommendations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.List;

@Component
public class ScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);

    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");

    @Value("${accuweather.forecastApiHost}")
    private String forecastApiHost;
    @Value("${accuweather.cityId}")
    private String cityId;
    @Value("${accuweather.apiKey}")
    private String apiKey;
    @Value("${accuweather.queryOptions}")
    private String queryOptions;

    @Scheduled(fixedRate = 5000)
    public void reportCurrentTime() {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<Forecast>> mapType = new TypeReference<List<Forecast>>() {};
        RestTemplate restTemplate = new RestTemplateBuilder().build();
        String response = restTemplate.getForObject(
                "http://"+forecastApiHost+"/forecasts/v1/hourly/12hour/"+cityId+"?apikey="+apiKey+queryOptions, String.class);
        List<Forecast> jsonToPersonList = null;
        try {
            jsonToPersonList = mapper.readValue(response, mapType);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        log.info(jsonToPersonList.toString());
    }
}
