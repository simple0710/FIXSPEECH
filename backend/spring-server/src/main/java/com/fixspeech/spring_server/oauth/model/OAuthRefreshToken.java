package com.fixspeech.spring_server.oauth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@RedisHash(value = "oauthRefreshToken", timeToLive = 604800)
public class OAuthRefreshToken {
	@Id
	private String email;

	private String token;
}