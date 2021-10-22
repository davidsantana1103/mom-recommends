package com.recommendations;

import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Forecast {
    private Map<String, Object> Temperature;
    private Map<String, Object> RealFeelTemperature;
    private String DateTime;
    private Double PrecipitationProbability;

    @JsonProperty("Temperature")
    public Map<String, Object> getTemperature() {
        return Temperature;
    }
    @JsonProperty("Temperature")
    public void setTemperature(Map<String, Object> temperature) {
        Temperature = temperature;
    }
    @JsonProperty("RealFeelTemperature")
    public Map<String, Object> getRealFeelTemperature() {
        return RealFeelTemperature;
    }
    @JsonProperty("RealFeelTemperature")
    public void setRealFeelTemperature(Map<String, Object> realFeelTemperature) {
        RealFeelTemperature = realFeelTemperature;
    }
    @JsonProperty("DateTime")
    public String getDateTime() {
        return DateTime;
    }
    @JsonProperty("DateTime")
    public void setDateTime(String dateTime) {
        DateTime = dateTime;
    }
    @JsonProperty("PrecipitationProbability")
    public Double getPrecipitationProbability() {
        return PrecipitationProbability;
    }
    @JsonProperty("PrecipitationProbability")
    public void setPrecipitationProbability(Double precipitationProbability) {
        PrecipitationProbability = precipitationProbability;
    }

    @Override
    public String toString() {
        return "Forecast{" +
                "Temperature=" + Temperature +
                ", RealFeelTemperature=" + RealFeelTemperature +
                ", DateTime='" + DateTime + '\'' +
                ", PrecipitationProbability=" + PrecipitationProbability +
                '}';
    }
}
