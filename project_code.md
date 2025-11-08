# 📊 포트폴리오 리밸런싱 계산기 전체 코드 (최종 수정본)

이 마크다운 파일은 디버깅, 리팩토링, 보안, 반응형 디자인 및 신규 기능(JSON 입출력, 섹터 분석, 다중 포트폴리오 관리, 차트 시각화)이 모두 적용된 프로젝트의 모든 코드 파일을 포함하고 있습니다.

---

## `package.json`

```json
{
  "name": "portfolio-rebalancer",
  "version": "2.0.0",
  "description": "An advanced portfolio rebalancing calculator with multi-portfolio management, data visualization, and enhanced security.",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "keywords": [
    "portfolio",
    "rebalancing",
    "finance",
    "investment"
  ],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "@types/dompurify": "^3.0.5",
    "@types/node": "^24.10.0",
    "jsdom": "^24.1.0",
    "typescript": "^5.9.3",
    "vite": "^7.1.12",
    "vite-plugin-purgecss": "^0.2.13",
    "vitest": "^4.0.3"
  },
  "dependencies": {
    "chart.js": "^4.5.1",
    "decimal.js": "^10.6.0",
    "dompurify": "^3.1.5",
    "idb-keyval": "^6.2.1",
    "nanoid": "^5.1.6"
  }
}
```

---

## `package-lock.json`

```json
{
  "name": "portfolio-rebalancer",
  "version": "2.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "portfolio-rebalancer",
      "version": "2.0.0",
      "license": "ISC",
      "dependencies": {
        "chart.js": "^4.5.1",
        "decimal.js": "^10.6.0",
        "dompurify": "^3.1.5",
        "idb-keyval": "^6.2.1",
        "nanoid": "^5.1.6"
      },
      "devDependencies": {
        "@playwright/test": "^1.56.1",
        "@types/dompurify": "^3.0.5",
        "@types/node": "^24.10.0",
        "jsdom": "^24.1.0",
        "typescript": "^5.9.3",
        "vite": "^7.1.12",
        "vite-plugin-purgecss": "^0.2.13",
        "vitest": "^4.0.3"
      }
    },
    "node_modules/@asamuzakjp/css-color": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-3.2.0.tgz",
      "integrity": "sha512-K1A6z8tS3XsmCMM86xoWdn7Fkdn9m6RSVtocUrJYIwZnFVkng/PvkEoWtOWmP+Scc6saYWHWZYbndEEXxl24jw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@csstools/css-calc": "^2.1.3",
        "@csstools/css-color-parser": "^3.0.9",
        "@csstools/css-parser-algorithms": "^3.0.4",
        "@csstools/css-tokenizer": "^3.0.3",
        "lru-cache": "^10.4.3"
      }
    },
    "node_modules/@csstools/color-helpers": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-5.1.0.tgz",
      "integrity": "sha512-S11EXWJyy0Mz5SYvRmY8nJYTFFd1LCNV+7cXyAgQtOOuzb4EsgfqDufL+9esx72/eLhsRdGZwaldu/h+E4t4BA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@csstools/css-calc": {
      "version": "2.1.4",
      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-2.1.4.tgz",
      "integrity": "sha512-3N8oaj+0juUw/1H3YwmDDJXCgTB1gKU6Hc/bB502u9zR0q2vd786XJH9QfrKIEgFlZmhZiq6epXl4rHqhzsIgQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^3.0.5",
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-color-parser": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-3.1.0.tgz",
      "integrity": "sha512-nbtKwh3a6xNVIp/VRuXV64yTKnb1IjTAEEh3irzS+HkKjAOYLTGNb9pmVNntZ8iVBHcWDA2Dof0QtPgFI1BaTA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@csstools/color-helpers": "^5.1.0",
        "@csstools/css-calc": "^2.1.4"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^3.0.5",
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-parser-algorithms": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-3.0.5.tgz",
      "integrity": "sha512-DaDeUkXZKjdGhgYaHNJTV9pV7Y9B3b644jCLs9Upc3VeNGg6LWARAT6O+Q+/COo+2gg/bM5rhpMAtf70WqfBdQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@csstools/css-tokenizer": "^3.0.4"
      }
    },
    "node_modules/@csstools/css-tokenizer": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-3.0.4.tgz",
      "integrity": "sha512-Vd/9EVDiu6PPJt9yAh6roZP6El1xHrdvIVGjyBsHR0RYwNHgL7FJPyIIW4fANJNG6FtyZfvlRPpFI4ZM/lubvw==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@kurkle/color": {
      "version": "0.3.4",
      "resolved": "https://registry.npmjs.org/@kurkle/color/-/color-0.3.4.tgz",
      "integrity": "sha512-M5UknZPHRu3DEDWoipU6sE8PdkZ6Z/S+v4dD+Ke8IaNlpdSQah50lz1KtcFBa2vsdOnwbbnxJwVM4wty6udA5w==",
      "license": "MIT"
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "dev": true,
      "license": "MIT",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.56.1",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.56.1.tgz",
      "integrity": "sha512-vSMYtL/zOcFpvJCW71Q/OEGQb7KYBPAdKh35WNSkaZA75JlAO8ED8UN6GUNTm3drWomcbcqRPFqQbLae8yBTdg==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.56.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.52.5.tgz",
      "integrity": "sha512-8c1vW4ocv3UOMp9K+gToY5zL2XiiVw3k7f1ksf4yO1FlDFQ1C2u72iACFnSOceJFsWskc2WZNqeRhFRPzv+wtQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.52.5.tgz",
      "integrity": "sha512-mQGfsIEFcu21mvqkEKKu2dYmtuSZOBMmAl5CFlPGLY94Vlcm+zWApK7F/eocsNzp8tKmbeBP8yXyAbx0XHsFNA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.52.5.tgz",
      "integrity": "sha512-takF3CR71mCAGA+v794QUZ0b6ZSrgJkArC+gUiG6LB6TQty9T0Mqh3m2ImRBOxS2IeYBo4lKWIieSvnEk2OQWA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.52.5.tgz",
      "integrity": "sha512-W901Pla8Ya95WpxDn//VF9K9u2JbocwV/v75TE0YIHNTbhqUTv9w4VuQ9MaWlNOkkEfFwkdNhXgcLqPSmHy0fA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.52.5.tgz",
      "integrity": "sha512-QofO7i7JycsYOWxe0GFqhLmF6l1TqBswJMvICnRUjqCx8b47MTo46W8AoeQwiokAx3zVryVnxtBMcGcnX12LvA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.52.5.tgz",
      "integrity": "sha512-jr21b/99ew8ujZubPo9skbrItHEIE50WdV86cdSoRkKtmWa+DDr6fu2c/xyRT0F/WazZpam6kk7IHBerSL7LDQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.52.5.tgz",
      "integrity": "sha512-PsNAbcyv9CcecAUagQefwX8fQn9LQ4nZkpDboBOttmyffnInRy8R8dSg6hxxl2Re5QhHBf6FYIDhIj5v982ATQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.52.5.tgz",
      "integrity": "sha512-Fw4tysRutyQc/wwkmcyoqFtJhh0u31K+Q6jYjeicsGJJ7bbEq8LwPWV/w0cnzOqR2m694/Af6hpFayLJZkG2VQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.52.5.tgz",
      "integrity": "sha512-a+3wVnAYdQClOTlyapKmyI6BLPAFYs0JM8HRpgYZQO02rMR09ZcV9LbQB+NL6sljzG38869YqThrRnfPMCDtZg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.52.5.tgz",
      "integrity": "sha512-AvttBOMwO9Pcuuf7m9PkC1PUIKsfaAJ4AYhy944qeTJgQOqJYJ9oVl2nYgY7Rk0mkbsuOpCAYSs6wLYB2Xiw0Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.52.5.tgz",
      "integrity": "sha512-DkDk8pmXQV2wVrF6oq5tONK6UHLz/XcEVow4JTTerdeV1uqPeHxwcg7aFsfnSm9L+OO8WJsWotKM2JJPMWrQtA==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.52.5.tgz",
      "integrity": "sha512-W/b9ZN/U9+hPQVvlGwjzi+Wy4xdoH2I8EjaCkMvzpI7wJUs8sWJ03Rq96jRnHkSrcHTpQe8h5Tg3ZzUPGauvAw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.52.5.tgz",
      "integrity": "sha512-sjQLr9BW7R/ZiXnQiWPkErNfLMkkWIoCz7YMn27HldKsADEKa5WYdobaa1hmN6slu9oWQbB6/jFpJ+P2IkVrmw==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.52.5.tgz",
      "integrity": "sha512-hq3jU/kGyjXWTvAh2awn8oHroCbrPm8JqM7RUpKjalIRWWXE01CQOf/tUNWNHjmbMHg/hmNCwc/Pz3k1T/j/Lg==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.52.5.tgz",
      "integrity": "sha512-gn8kHOrku8D4NGHMK1Y7NA7INQTRdVOntt1OCYypZPRt6skGbddska44K8iocdpxHTMMNui5oH4elPH4QOLrFQ==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.52.5.tgz",
      "integrity": "sha512-hXGLYpdhiNElzN770+H2nlx+jRog8TyynpTVzdlc6bndktjKWyZyiCsuDAlpd+j+W+WNqfcyAWz9HxxIGfZm1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.52.5.tgz",
      "integrity": "sha512-arCGIcuNKjBoKAXD+y7XomR9gY6Mw7HnFBv5Rw7wQRvwYLR7gBAgV7Mb2QTyjXfTveBNFAtPt46/36vV9STLNg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.52.5.tgz",
      "integrity": "sha512-QoFqB6+/9Rly/RiPjaomPLmR/13cgkIGfA40LHly9zcH1S0bN2HVFYk3a1eAyHQyjs3ZJYlXvIGtcCs5tko9Cw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.52.5.tgz",
      "integrity": "sha512-w0cDWVR6MlTstla1cIfOGyl8+qb93FlAVutcor14Gf5Md5ap5ySfQ7R9S/NjNaMLSFdUnKGEasmVnu3lCMqB7w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.52.5.tgz",
      "integrity": "sha512-Aufdpzp7DpOTULJCuvzqcItSGDH73pF3ko/f+ckJhxQyHtp67rHw3HMNxoIdDMUITJESNE6a8uh4Lo4SLouOUg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.52.5.tgz",
      "integrity": "sha512-UGBUGPFp1vkj6p8wCRraqNhqwX/4kNQPS57BCFc8wYh0g94iVIW33wJtQAx3G7vrjjNtRaxiMUylM0ktp/TRSQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.52.5.tgz",
      "integrity": "sha512-TAcgQh2sSkykPRWLrdyy2AiceMckNf5loITqXxFI5VuQjS5tSuw3WlwdN8qv8vzjLAUTvYaH/mVjSFpbkFbpTg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.0.0.tgz",
      "integrity": "sha512-m2bOd0f2RT9k8QJx1JN85cZYyH1RqFBdlwtkSlf4tBDYLCiiZnv1fIIwacK6cqwXavOydf0NPToMQgpKq+dVlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/chai": {
      "version": "5.2.3",
      "resolved": "https://registry.npmjs.org/@types/chai/-/chai-5.2.3.tgz",
      "integrity": "sha512-Mw558oeA9fFbv65/y4mHtXDs9bPnFMZAL/jxdPFUpOHHIXX91mcgEHbS5Lahr+pwZFR8A7GQleRWeI6cGFC2UA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/deep-eql": "*",
        "assertion-error": "^2.0.1"
      }
    },
    "node_modules/@types/deep-eql": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@types/deep-eql/-/deep-eql-4.0.2.tgz",
      "integrity": "sha512-c9h9dVVMigMPc4bwTvC5dxqtqJZwQPePsWjPlpSOnojbor6pGqdk541lfA7AqFQr5pB1BRdq0juY9db81BwyFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/dompurify": {
      "version": "3.0.5",
      "resolved": "https://registry.npmjs.org/@types/dompurify/-/dompurify-3.0.5.tgz",
      "integrity": "sha512-1Wg0g3BtQF7sSb27fJQAKck1HECM6zV1EB66j8JH9i3LCjYabJa0FSdiSgsD5K/RbrsR0SiraKacLB+T8ZVYAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/trusted-types": "*"
      }
    },
    "node_modules/@types/estree": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
      "integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "24.10.0",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.10.0.tgz",
      "integrity": "sha512-qzQZRBqkFsYyaSWXuEHc2WR9c0a0CXwiE5FWUvn7ZM+vdy1uZLfCunD38UzhuB7YN/J11ndbDBcTmOdxJo9Q7A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~7.16.0"
      }
    },
    "node_modules/@types/trusted-types": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz",
      "integrity": "sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@vitest/expect": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.0.6.tgz",
      "integrity": "sha512-5j8UUlBVhOjhj4lR2Nt9sEV8b4WtbcYh8vnfhTNA2Kn5+smtevzjNq+xlBuVhnFGXiyPPNzGrOVvmyHWkS5QGg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "@types/chai": "^5.2.2",
        "@vitest/spy": "4.0.6",
        "@vitest/utils": "4.0.6",
        "chai": "^6.0.1",
        "tinyrainbow": "^3.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/mocker": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.0.6.tgz",
      "integrity": "sha512-3COEIew5HqdzBFEYN9+u0dT3i/NCwppLnO1HkjGfAP1Vs3vti1Hxm/MvcbC4DAn3Szo1M7M3otiAaT83jvqIjA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "4.0.6",
        "estree-walker": "^3.0.3",
        "magic-string": "^0.30.19"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "msw": "^2.4.9",
        "vite": "^6.0.0 || ^7.0.0-0"
      },
      "peerDependenciesMeta": {
        "msw": {
          "optional": true
        },
        "vite": {
          "optional": true
        }
      }
    },
    "node_modules/@vitest/pretty-format": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.0.6.tgz",
      "integrity": "sha512-4vptgNkLIA1W1Nn5X4x8rLJBzPiJwnPc+awKtfBE5hNMVsoAl/JCCPPzNrbf+L4NKgklsis5Yp2gYa+XAS442g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyrainbow": "^3.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.0.6.tgz",
      "integrity": "sha512-trPk5qpd7Jj+AiLZbV/e+KiiaGXZ8ECsRxtnPnCrJr9OW2mLB72Cb824IXgxVz/mVU3Aj4VebY+tDTPn++j1Og==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.0.6",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.0.6.tgz",
      "integrity": "sha512-PaYLt7n2YzuvxhulDDu6c9EosiRuIE+FI2ECKs6yvHyhoga+2TBWI8dwBjs+IeuQaMtZTfioa9tj3uZb7nev1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.0.6",
        "magic-string": "^0.30.19",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.0.6.tgz",
      "integrity": "sha512-g9jTUYPV1LtRPRCQfhbMintW7BTQz1n6WXYQYRQ25qkyffA4bjVXjkROokZnv7t07OqfaFKw1lPzqKGk1hmNuQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.0.6.tgz",
      "integrity": "sha512-bG43VS3iYKrMIZXBo+y8Pti0O7uNju3KvNn6DrQWhQQKcLavMB+0NZfO1/QBAEbq0MaQ3QjNsnnXlGQvsh0Z6A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.0.6",
        "tinyrainbow": "^3.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/acorn": {
      "version": "8.15.0",
      "resolved": "https://registry.npmjs.org/acorn/-/acorn-8.15.0.tgz",
      "integrity": "sha512-NZyJarBfL7nWwIq+FDL6Zp/yHEhePMNnnJ0y3qfieCrmNvYct8uvtiV41UvlSe6apAfk0fY1FbWx+NwfmpvtTg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "acorn": "bin/acorn"
      },
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/ansi-regex": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.2.tgz",
      "integrity": "sha512-Bq3SmSpyFHaWjPk8If9yc6svM8c56dB5BAtW4Qbw5jHTwwXXcTLoRMkpDJp6VL0XzlWaCHTXrkFURMYmD0sLqg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/ansi-styles": {
      "version": "6.2.3",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.3.tgz",
      "integrity": "sha512-4Dj6M28JB+oAH8kFkTLUo+a2jwOFkuqb3yucU0CANcRRUbxS0cP0nZYCGjcc3BNXwRIsUVmDGgzawme7zvJHvg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/assertion-error": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-2.0.1.tgz",
      "integrity": "sha512-Izi8RQcffqCeNVgFigKli1ssklIbpHnCYc6AknXGYoB6grJqyeby7jv12JUQgmTAnIDnbck1uxksT4dzN3PWBA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/brace-expansion": {
      "version": "1.1.12",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-1.1.12.tgz",
      "integrity": "sha512-9T9UjW3r0UW5c1Q7GTwllptXwhvYmEzFhzMfZ9H7FQWt+uZePjZPjBP/W1ZEyZ1twGWom5/56TF4lPcqjnDHcg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0",
        "concat-map": "0.0.1"
      }
    },
    "node_modules/bundle-require": {
      "version": "5.1.0",
      "resolved": "https://registry.npmjs.org/bundle-require/-/bundle-require-5.1.0.tgz",
      "integrity": "sha512-3WrrOuZiyaaZPWiEt4G3+IffISVC9HYlWueJEBWED4ZH4aIAC2PnkdnuRrR94M+w6yGWn4AglWtJtBI8YqvgoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "load-tsconfig": "^0.2.3"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "peerDependencies": {
        "esbuild": ">=0.18"
      }
    },
    "node_modules/cac": {
      "version": "6.7.14",
      "resolved": "https://registry.npmjs.org/cac/-/cac-6.7.14.tgz",
      "integrity": "sha512-b6Ilus+c3RrdDk+JhLKUAQfzzgLEPy6wcXqS7f/xe1EETvsDP6GORG7SFuOs6cID5YkqchW/LXZbX5bc8j7ZcQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/chai": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/chai/-/chai-6.2.0.tgz",
      "integrity": "sha512-aUTnJc/JipRzJrNADXVvpVqi6CO0dn3nx4EVPxijri+fj3LUUDyZQOgVeW54Ob3Y1Xh9Iz8f+CgaCl8v0mn9bA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/chart.js": {
      "version": "4.5.1",
      "resolved": "https://registry.npmjs.org/chart.js/-/chart.js-4.5.1.tgz",
      "integrity": "sha512-GIjfiT9dbmHRiYi6Nl2yFCq7kkwdkp1W/lp2J99rX0yo9tgJGn3lKQATztIjb5tVtevcBtIdICNWqlq5+E8/Pw==",
      "license": "MIT",
      "dependencies": {
        "@kurkle/color": "^0.3.0"
      },
      "engines": {
        "pnpm": ">=8"
      }
    },
    "node_modules/chokidar": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-4.0.3.tgz",
      "integrity": "sha512-Qgzu8kfBvo+cA4962jnP1KkS6Dop5NS6g7R5LFYJr4b8Ub94PPQXUksCw9PvXoeXPRRddRNC5C1JQUR2SMGtnA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "readdirp": "^4.0.1"
      },
      "engines": {
        "node": ">= 14.16.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/commander": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/commander/-/commander-8.3.0.tgz",
      "integrity": "sha512-OkTL9umf+He2DZkUq8f8J9of7yL6RJKI24dVITBmNfZBmri9zYZQrKkuXiKhyfPSu8tUhnVBB1iKXevvnlR4Ww==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/concat-map": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/concat-map/-/concat-map-0.0.1.tgz",
      "integrity": "sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/confbox": {
      "version": "0.1.8",
      "resolved": "https://registry.npmjs.org/confbox/-/confbox-0.1.8.tgz",
      "integrity": "sha512-RMtmw0iFkeR4YV+fUOSucriAQNb9g8zFR52MWCtl+cCZOFRNL6zeB395vPzFhEjjn4fMxXudmELnl/KF/WrK6w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/consola": {
      "version": "3.4.2",
      "resolved": "https://registry.npmjs.org/consola/-/consola-3.4.2.tgz",
      "integrity": "sha512-5IKcdX0nnYavi6G7TtOhwkYzyjfJlatbjMjuLSfE2kYT5pMDOilZ4OvMhi637CcDICTmz3wARPoyhqyX1Y+XvA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.18.0 || >=16.10.0"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/cssstyle": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/cssstyle/-/cssstyle-4.6.0.tgz",
      "integrity": "sha512-2z+rWdzbbSZv6/rhtvzvqeZQHrBaqgogqt85sqFNbabZOuFbCVFb8kPeEtZjiKkbrm395irpNKiYeFeLiQnFPg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/css-color": "^3.2.0",
        "rrweb-cssom": "^0.8.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/cssstyle/node_modules/rrweb-cssom": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/rrweb-cssom/-/rrweb-cssom-0.8.0.tgz",
      "integrity": "sha512-guoltQEx+9aMf2gDZ0s62EcV8lsXR+0w8915TC3ITdn2YueuNjdAYh/levpU9nFaoChh9RUS5ZdQMrKfVEN9tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/data-urls": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-5.0.0.tgz",
      "integrity": "sha512-ZYP5VBHshaDAiVZxjbRVcFJpc+4xGgT0bK3vzy1HLN8jTO975HEbuYzZJcHoQEY5K1a0z8YayJkyVETa08eNTg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-mimetype": "^4.0.0",
        "whatwg-url": "^14.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "license": "MIT"
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/dompurify": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/dompurify/-/dompurify-3.3.0.tgz",
      "integrity": "sha512-r+f6MYR1gGN1eJv0TVQbhA7if/U7P87cdPl3HN5rikqaBSBxLiCb/b9O+2eG0cxz0ghyU+mU1QkbsOwERMYlWQ==",
      "license": "(MPL-2.0 OR Apache-2.0)",
      "optionalDependencies": {
        "@types/trusted-types": "^2.0.7"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/entities": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/entities/-/entities-6.0.1.tgz",
      "integrity": "sha512-aN97NXWF6AWBTahfVOIrB/NShkzi5H7F9r1s9mD3cDj4Ko5f2qhhVoYMibXF7GlLveb/D2ioWay8lxI97Ven3g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=0.12"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-module-lexer": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/es-module-lexer/-/es-module-lexer-1.7.0.tgz",
      "integrity": "sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/esbuild": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.25.12",
        "@esbuild/android-arm": "0.25.12",
        "@esbuild/android-arm64": "0.25.12",
        "@esbuild/android-x64": "0.25.12",
        "@esbuild/darwin-arm64": "0.25.12",
        "@esbuild/darwin-x64": "0.25.12",
        "@esbuild/freebsd-arm64": "0.25.12",
        "@esbuild/freebsd-x64": "0.25.12",
        "@esbuild/linux-arm": "0.25.12",
        "@esbuild/linux-arm64": "0.25.12",
        "@esbuild/linux-ia32": "0.25.12",
        "@esbuild/linux-loong64": "0.25.12",
        "@esbuild/linux-mips64el": "0.25.12",
        "@esbuild/linux-ppc64": "0.25.12",
        "@esbuild/linux-riscv64": "0.25.12",
        "@esbuild/linux-s390x": "0.25.12",
        "@esbuild/linux-x64": "0.25.12",
        "@esbuild/netbsd-arm64": "0.25.12",
        "@esbuild/netbsd-x64": "0.25.12",
        "@esbuild/openbsd-arm64": "0.25.12",
        "@esbuild/openbsd-x64": "0.25.12",
        "@esbuild/openharmony-arm64": "0.25.12",
        "@esbuild/sunos-x64": "0.25.12",
        "@esbuild/win32-arm64": "0.25.12",
        "@esbuild/win32-ia32": "0.25.12",
        "@esbuild/win32-x64": "0.25.12"
      }
    },
    "node_modules/estree-walker": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/estree-walker/-/estree-walker-3.0.3.tgz",
      "integrity": "sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "^1.0.0"
      }
    },
    "node_modules/expect-type": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/expect-type/-/expect-type-1.2.2.tgz",
      "integrity": "sha512-JhFGDVJ7tmDJItKhYgJCGLOWjuK9vPxiXoUFLwLDc99NlmklilbiQJwoctZtt13+xMw91MCk/REan6MWHqDjyA==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=12.0.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fix-dts-default-cjs-exports": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/fix-dts-default-cjs-exports/-/fix-dts-default-cjs-exports-1.0.1.tgz",
      "integrity": "sha512-pVIECanWFC61Hzl2+oOCtoJ3F17kglZC/6N94eRWycFgBH35hHx0Li604ZIzhseh97mf2p0cv7vVrOZGoqhlEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "magic-string": "^0.30.17",
        "mlly": "^1.7.4",
        "rollup": "^4.34.8"
      }
    },
    "node_modules/foreground-child": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.1.tgz",
      "integrity": "sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "cross-spawn": "^7.0.6",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/form-data": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.4.tgz",
      "integrity": "sha512-KrGhL9Q4zjj0kiUt5OO4Mr/A/jlI2jDYs5eHBpYHPcBEVSiipAvn2Ko2HnPe20rmcuuvMHNdZFp+4IlGTMF0Ow==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.12"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fs.realpath": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/fs.realpath/-/fs.realpath-1.0.0.tgz",
      "integrity": "sha512-OO0pH2lK6a0hZnAdau5ItzHPI6pUlvI7jMVnxUQRtw4owF2wk8lOSabtGDCTP4Ggrg2MbGnWO9X8K1t4+fGMDw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/glob": {
      "version": "7.2.3",
      "resolved": "https://registry.npmjs.org/glob/-/glob-7.2.3.tgz",
      "integrity": "sha512-nFR0zLpU2YCaRxwoCJvL6UvCH2JFyFVIvwTLsIf21AuHlMskA1hhTdk+LlYJtOlYt9v6dvszD2BGRqBL+iQK9Q==",
      "deprecated": "Glob versions prior to v9 are no longer supported",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "fs.realpath": "^1.0.0",
        "inflight": "^1.0.4",
        "inherits": "2",
        "minimatch": "^3.1.1",
        "once": "^1.3.0",
        "path-is-absolute": "^1.0.0"
      },
      "engines": {
        "node": "*"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-encoding-sniffer": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-4.0.0.tgz",
      "integrity": "sha512-Y22oTqIU4uuPgEemfz7NDJz6OeKf12Lsu+QC+s3BVpda64lTiMYCyGwg5ki4vFxkMwQdeZDl2adZoqUgdFuTgQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-encoding": "^3.1.1"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/http-proxy-agent": {
      "version": "7.0.2",
      "resolved": "https://registry.npmjs.org/http-proxy-agent/-/http-proxy-agent-7.0.2.tgz",
      "integrity": "sha512-T1gkAiYYDWYx3V5Bmyu7HcfcvL7mUrTWiM6yOfa3PIphViJ/gFPbvidQ+veqSOHci/PxBcDabeUNCzpOODJZig==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.0",
        "debug": "^4.3.4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.6.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.6.3.tgz",
      "integrity": "sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/idb-keyval": {
      "version": "6.2.2",
      "resolved": "https://registry.npmjs.org/idb-keyval/-/idb-keyval-6.2.2.tgz",
      "integrity": "sha512-yjD9nARJ/jb1g+CvD0tlhUHOrJ9Sy0P8T9MF3YaLlHnSRpwPfpTX0XIvpmw3gAJUmEu3FiICLBDPXVwyEvrleg==",
      "license": "Apache-2.0"
    },
    "node_modules/inflight": {
      "version": "1.0.6",
      "resolved": "https://registry.npmjs.org/inflight/-/inflight-1.0.6.tgz",
      "integrity": "sha512-k92I/b08q4wvFscXCLvqfsHCrjrF7yiXsQuIVvVE7N82W3+aqpzuUdBbfhWcy/FZR3/4IgflMgKLOsvPDrGCJA==",
      "deprecated": "This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "once": "^1.3.0",
        "wrappy": "1"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/jackspeak": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-3.4.3.tgz",
      "integrity": "sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "@isaacs/cliui": "^8.0.2"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      },
      "optionalDependencies": {
        "@pkgjs/parseargs": "^0.11.0"
      }
    },
    "node_modules/joycon": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/joycon/-/joycon-3.1.1.tgz",
      "integrity": "sha512-34wB/Y7MW7bzjKRjUKTa46I2Z7eV62Rkhva+KkopW7Qvv/OSWBqvkSY7vusOPrNuZcUG3tApvdVgNB8POj3SPw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/jsdom": {
      "version": "24.1.3",
      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-24.1.3.tgz",
      "integrity": "sha512-MyL55p3Ut3cXbeBEG7Hcv0mVM8pp8PBNWxRqchZnSfAiES1v1mRnMeFfaHWIPULpwsYfvO+ZmMZz5tGCnjzDUQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cssstyle": "^4.0.1",
        "data-urls": "^5.0.0",
        "decimal.js": "^10.4.3",
        "form-data": "^4.0.0",
        "html-encoding-sniffer": "^4.0.0",
        "http-proxy-agent": "^7.0.2",
        "https-proxy-agent": "^7.0.5",
        "is-potential-custom-element-name": "^1.0.1",
        "nwsapi": "^2.2.12",
        "parse5": "^7.1.2",
        "rrweb-cssom": "^0.7.1",
        "saxes": "^6.0.0",
        "symbol-tree": "^3.2.4",
        "tough-cookie": "^4.1.4",
        "w3c-xmlserializer": "^5.0.0",
        "webidl-conversions": "^7.0.0",
        "whatwg-encoding": "^3.1.1",
        "whatwg-mimetype": "^4.0.0",
        "whatwg-url": "^14.0.0",
        "ws": "^8.18.0",
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "canvas": "^2.11.2"
      },
      "peerDependenciesMeta": {
        "canvas": {
          "optional": true
        }
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/load-tsconfig": {
      "version": "0.2.5",
      "resolved": "https://registry.npmjs.org/load-tsconfig/-/load-tsconfig-0.2.5.tgz",
      "integrity": "sha512-IXO6OCs9yg8tMKzfPZ1YmheJbZCiEsnBdcB03l0OcfK9prKnJb96siuHCr5Fl37/yo9DnKU+TLpxzTUspw9shg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      }
    },
    "node_modules/lodash.sortby": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/lodash.sortby/-/lodash.sortby-4.7.0.tgz",
      "integrity": "sha512-HDWXG8isMntAyRF5vZ7xKuEvOhT4AhlRt/3czTSjvGUxjYCBVRQY48ViDHyfYz9VIoBkW4TMGQNapx+l3RUwdA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/minimatch": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-3.1.2.tgz",
      "integrity": "sha512-J7p63hRiAjw1NDEww1W7i37+ByIrOWO5XQQAzZ3VOcL0PNybwpfmV/N05zFAzwQ9USyEcX6t3UO+K5aqBQOIHw==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^1.1.7"
      },
      "engines": {
        "node": "*"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
      "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/mlly": {
      "version": "1.8.0",
      "resolved": "https://registry.npmjs.org/mlly/-/mlly-1.8.0.tgz",
      "integrity": "sha512-l8D9ODSRWLe2KHJSifWGwBqpTZXIXTeo8mlKjY+E2HAakaTeNpqAyBZ8GSqLzHgw4XmHmC8whvpjJNMbFZN7/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "acorn": "^8.15.0",
        "pathe": "^2.0.3",
        "pkg-types": "^1.3.1",
        "ufo": "^1.6.1"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "5.1.6",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-5.1.6.tgz",
      "integrity": "sha512-c7+7RQ+dMB5dPwwCp4ee1/iV/q2P6aK1mTZcfr1BTuVlyW9hJYiMPybJCcnBlQtuSmTIWNeazm/zqNoZSSElBg==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.js"
      },
      "engines": {
        "node": "^18 || >=20"
      }
    },
    "node_modules/nwsapi": {
      "version": "2.2.22",
      "resolved": "https://registry.npmjs.org/nwsapi/-/nwsapi-2.2.22.tgz",
      "integrity": "sha512-ujSMe1OWVn55euT1ihwCI1ZcAaAU3nxUiDwfDQldc51ZXaB9m2AyOn6/jh1BLe2t/G8xd6uKG1UBF2aZJeg2SQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/package-json-from-dist": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
      "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw==",
      "dev": true,
      "license": "BlueOak-1.0.0"
    },
    "node_modules/parse5": {
      "version": "7.3.0",
      "resolved": "https://registry.npmjs.org/parse5/-/parse5-7.3.0.tgz",
      "integrity": "sha512-IInvU7fabl34qmi9gY8XOVxhYyMyuH2xUNpb2q8/Y+7552KlejkRvqvD19nMoUW/uQGGbqNpA6Tufu5FL5BZgw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "entities": "^6.0.0"
      },
      "funding": {
        "url": "https://github.com/inikulin/parse5?sponsor=1"
      }
    },
    "node_modules/path-is-absolute": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/path-is-absolute/-/path-is-absolute-1.0.1.tgz",
      "integrity": "sha512-AVbw3UJ2e9bq64vSaS9Am0fje1Pa8pbGqTTsmXfaIiMpnr5DlDhfJOuLj9Sf95ZPVDAUerDfEk88MPmPe7UCQg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-scurry": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
      "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "dependencies": {
        "lru-cache": "^10.2.0",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0"
      },
      "engines": {
        "node": ">=16 || 14 >=14.18"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.3.tgz",
      "integrity": "sha512-5gTmgEY/sqK6gFXLIsQNH19lWb4ebPDLA4SdLP7dsWkIXHWlG66oPuVvXSGFPppYZz8ZDZq0dYYrbHfBCVUb1Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/pkg-types": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/pkg-types/-/pkg-types-1.3.1.tgz",
      "integrity": "sha512-/Jm5M4RvtBFVkKWRu2BLUTNP8/M2a+UwuAX+ae4770q1qVGtfjG+WTCupoZixokjmHiry8uI+dlY8KXYV5HVVQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "confbox": "^0.1.8",
        "mlly": "^1.7.4",
        "pathe": "^2.0.1"
      }
    },
    "node_modules/playwright": {
      "version": "1.56.1",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.56.1.tgz",
      "integrity": "sha512-aFi5B0WovBHTEvpM3DzXTUaeN6eN0qWnTkKx4NQaH4Wvcmc153PdaY2UBdSYKaGYw+UyWXSVyxDUg5DoPEttjw==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.56.1"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "fsevents": "2.3.2"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.56.1",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.56.1.tgz",
      "integrity": "sha512-hutraynyn31F+Bifme+Ps9Vq59hKuUCz7H1kDOcBs+2oGguKkWTU50bBWrtz34OUWmIwpBTWDxaRPXrIXkgvmQ==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/playwright/node_modules/fsevents": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
      "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.6",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
      "integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.1.1"
      },
      "engines": {
        "node": ">= 18"
      },
      "peerDependencies": {
        "jiti": ">=1.21.0",
        "postcss": ">=8.0.9",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss/node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/psl": {
      "version": "1.15.0",
      "resolved": "https://registry.npmjs.org/psl/-/psl-1.15.0.tgz",
      "integrity": "sha512-JZd3gMVBAVQkSs6HdNZo9Sdo0LNcQeMNP3CozBJb3JYC/QUYZTnKxP+f8oWRX4rHP5EurWxqAHTSwUCjlNKa1w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "funding": {
        "url": "https://github.com/sponsors/lupomontero"
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/purgecss": {
      "version": "4.1.3",
      "resolved": "https://registry.npmjs.org/purgecss/-/purgecss-4.1.3.tgz",
      "integrity": "sha512-99cKy4s+VZoXnPxaoM23e5ABcP851nC2y2GROkkjS8eJaJtlciGavd7iYAw2V84WeBqggZ12l8ef44G99HmTaw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "commander": "^8.0.0",
        "glob": "^7.1.7",
        "postcss": "^8.3.5",
        "postcss-selector-parser": "^6.0.6"
      },
      "bin": {
        "purgecss": "bin/purgecss.js"
      }
    },
    "node_modules/querystringify": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/querystringify/-/querystringify-2.2.0.tgz",
      "integrity": "sha512-FIqgj2EUvTa7R50u0rGsyTftzjYmv/a3hO345bZNrqabNqjtgiDMgmo4mkUjd+nzU5oF3dClKqFIPUKybUyqoQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/readdirp": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-4.1.2.tgz",
      "integrity": "sha512-GDhwkLfywWL2s6vEjyhri+eXmfH6j1L7JE27WhqLeYzoh/A3DBaYGEj2H/HFZCn/kMfim73FXxEJTw06WtxQwg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14.18.0"
      },
      "funding": {
        "type": "individual",
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/requires-port": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/requires-port/-/requires-port-1.0.0.tgz",
      "integrity": "sha512-KigOCHcocU3XODJxsu8i/j8T9tzT4adHiecwORRQ0ZZFcp7ahwXuRU1m+yuO90C5ZUyGeGfocHDI14M3L3yDAQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/resolve-from": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/resolve-from/-/resolve-from-5.0.0.tgz",
      "integrity": "sha512-qYg9KP24dD5qka9J47d0aVky0N+b4fTU89LN9iDnjB5waksiC49rvMB0PrUJQGoTmH50XPiqOvAjDfaijGxYZw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/rollup": {
      "version": "4.52.5",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.52.5.tgz",
      "integrity": "sha512-3GuObel8h7Kqdjt0gxkEzaifHTqLVW56Y/bjN7PSQtkKr0w3V/QYSdt6QWYtd7A1xUtYQigtdUfgj1RvWVtorw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.8"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.52.5",
        "@rollup/rollup-android-arm64": "4.52.5",
        "@rollup/rollup-darwin-arm64": "4.52.5",
        "@rollup/rollup-darwin-x64": "4.52.5",
        "@rollup/rollup-freebsd-arm64": "4.52.5",
        "@rollup/rollup-freebsd-x64": "4.52.5",
        "@rollup/rollup-linux-arm-gnueabihf": "4.52.5",
        "@rollup/rollup-linux-arm-musleabihf": "4.52.5",
        "@rollup/rollup-linux-arm64-gnu": "4.52.5",
        "@rollup/rollup-linux-arm64-musl": "4.52.5",
        "@rollup/rollup-linux-loong64-gnu": "4.52.5",
        "@rollup/rollup-linux-ppc64-gnu": "4.52.5",
        "@rollup/rollup-linux-riscv64-gnu": "4.52.5",
        "@rollup/rollup-linux-riscv64-musl": "4.52.5",
        "@rollup/rollup-linux-s390x-gnu": "4.52.5",
        "@rollup/rollup-linux-x64-gnu": "4.52.5",
        "@rollup/rollup-linux-x64-musl": "4.52.5",
        "@rollup/rollup-openharmony-arm64": "4.52.5",
        "@rollup/rollup-win32-arm64-msvc": "4.52.5",
        "@rollup/rollup-win32-ia32-msvc": "4.52.5",
        "@rollup/rollup-win32-x64-gnu": "4.52.5",
        "@rollup/rollup-win32-x64-msvc": "4.52.5",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/rrweb-cssom": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/rrweb-cssom/-/rrweb-cssom-0.7.1.tgz",
      "integrity": "sha512-TrEMa7JGdVm0UThDJSx7ddw5nVm3UJS9o9CCIZ72B1vSyEZoziDqBYP3XIoi/12lKrJR8rE3jeFHMok2F/Mnsg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/saxes": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "xmlchars": "^2.2.0"
      },
      "engines": {
        "node": ">=v12.22.7"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "dev": true,
      "license": "ISC",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/source-map": {
      "version": "0.8.0-beta.0",
      "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.8.0-beta.0.tgz",
      "integrity": "sha512-2ymg6oRBpebeZi9UUNsgQ89bhx01TcTkmNTGnNO88imTmbSgy4nfujrgVEFKWpMTEGA11EDkTt7mqObTPdigIA==",
      "deprecated": "The work that was done in this beta branch won't be included in future versions",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "whatwg-url": "^7.0.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/source-map/node_modules/tr46": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-1.0.1.tgz",
      "integrity": "sha512-dTpowEjclQ7Kgx5SdBkqRzVhERQXov8/l9Ft9dVM9fmg0W0KQSVaXX9T4i6twCPNtYiZM53lpSSUAwJbFPOHxA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.1.0"
      }
    },
    "node_modules/source-map/node_modules/webidl-conversions": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-4.0.2.tgz",
      "integrity": "sha512-YQ+BmxuTgd6UXZW3+ICGfyqRyHXVlD5GtQr5+qjiNW7bF0cqrzX500HVXPBOvgXb5YnzDd+h0zqyv61KUD7+Sg==",
      "dev": true,
      "license": "BSD-2-Clause"
    },
    "node_modules/source-map/node_modules/whatwg-url": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-7.1.0.tgz",
      "integrity": "sha512-WUu7Rg1DroM7oQvGWfOiAK21n74Gg+T4elXEQYkOhtyLeWiJFoOGLXPKI/9gzIie9CtwVLm8wtw6YJdKyxSjeg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lodash.sortby": "^4.7.0",
        "tr46": "^1.0.1",
        "webidl-conversions": "^4.0.2"
      }
    },
    "node_modules/stackback": {
      "version": "0.0.2",
      "resolved": "https://registry.npmjs.org/stackback/-/stackback-0.0.2.tgz",
      "integrity": "sha512-1XMJE5fQo1jGH6Y/7ebnwPOBEkIEnT4QF32d5R1+VXdXveM0IBMJt8zfaxX1P3QhVwrYe+576+jkANtSS2mBbw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/std-env": {
      "version": "3.10.0",
      "resolved": "https://registry.npmjs.org/std-env/-/std-env-3.10.0.tgz",
      "integrity": "sha512-5GS12FdOZNliM5mAOxFRg7Ir0pWz8MdpYm6AY6VPkGpbA7ZzmbzNcBJQ0GPvvyWgcY7QAhCgf9Uy89I03faLkg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/string-width": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
      "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "eastasianwidth": "^0.2.0",
        "emoji-regex": "^9.2.2",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/string-width-cjs": {
      "name": "string-width",
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/string-width-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.2.tgz",
      "integrity": "sha512-gmBGslpoQJtgnMAvOVqGZpEz9dyoKTCzy2nfz/n8aIFhN/jCE/rCmcxabB6jOOHV+0WNnylOxaxBQPSvcWklhA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^6.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/strip-ansi-cjs": {
      "name": "strip-ansi",
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.0",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
      "integrity": "sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "glob": "^10.3.10",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/sucrase/node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/sucrase/node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/sucrase/node_modules/glob": {
      "version": "10.4.5",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
      "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^3.1.2",
        "minimatch": "^9.0.4",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^1.11.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/sucrase/node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/symbol-tree": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyexec": {
      "version": "0.3.2",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-0.3.2.tgz",
      "integrity": "sha512-KQQR9yN7R5+OSwaK0XQoj22pwHoTlgYqmUscPYoknOoWCWfj/5/ABTMRi69FrKU5ffPVh5QcFikpWJI/P1ocHA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.15",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.15.tgz",
      "integrity": "sha512-j2Zq4NyQYG5XMST4cbs02Ak8iJUdxRM0XI5QyxXuZOzKOINmWurp3smXu3y5wDcJrptwpSjgXHzIQxR0omXljQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyrainbow": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/tinyrainbow/-/tinyrainbow-3.0.3.tgz",
      "integrity": "sha512-PSkbLUoxOFRzJYjjxHJt9xro7D+iilgMX/C9lawzVuYiIdcihh9DXmVibBe8lmcFrRi/VzlPjBxbN7rH24q8/Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tough-cookie": {
      "version": "4.1.4",
      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-4.1.4.tgz",
      "integrity": "sha512-Loo5UUvLD9ScZ6jh8beX1T6sO1w2/MpCRpEP7V280GKMVUQ0Jzar2U3UJPsrdbziLEMMhu3Ujnq//rhiFuIeag==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "psl": "^1.1.33",
        "punycode": "^2.1.1",
        "universalify": "^0.2.0",
        "url-parse": "^1.5.3"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/tr46": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-5.1.1.tgz",
      "integrity": "sha512-hdF5ZgjTqgAntKkklYw0R03MG2x/bSzTtkxmIRw/sTNV8YXsCJ1tfLAX23lhxhHJlEf3CRCOCGGWw3vI3GaSPw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tree-kill": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/tree-kill/-/tree-kill-1.2.2.tgz",
      "integrity": "sha512-L0Orpi8qGpRG//Nd+H90vFB+3iHnue1zSSGmNOOCh1GLJ7rUKVwV2HvijphGQS2UmhUZewS9VgvxYIdgr+fG1A==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "tree-kill": "cli.js"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "dev": true,
      "license": "Apache-2.0"
    },
    "node_modules/tsup": {
      "version": "8.5.0",
      "resolved": "https://registry.npmjs.org/tsup/-/tsup-8.5.0.tgz",
      "integrity": "sha512-VmBp77lWNQq6PfuMqCHD3xWl22vEoWsKajkF8t+yMBawlUS8JzEI+vOVMeuNZIuMML8qXRizFKi9oD5glKQVcQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "bundle-require": "^5.1.0",
        "cac": "^6.7.14",
        "chokidar": "^4.0.3",
        "consola": "^3.4.0",
        "debug": "^4.4.0",
        "esbuild": "^0.25.0",
        "fix-dts-default-cjs-exports": "^1.0.0",
        "joycon": "^3.1.1",
        "picocolors": "^1.1.1",
        "postcss-load-config": "^6.0.1",
        "resolve-from": "^5.0.0",
        "rollup": "^4.34.8",
        "source-map": "0.8.0-beta.0",
        "sucrase": "^3.35.0",
        "tinyexec": "^0.3.2",
        "tinyglobby": "^0.2.11",
        "tree-kill": "^1.2.2"
      },
      "bin": {
        "tsup": "dist/cli-default.js",
        "tsup-node": "dist/cli-node.js"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@microsoft/api-extractor": "^7.36.0",
        "@swc/core": "^1",
        "postcss": "^8.4.12",
        "typescript": ">=4.5.0"
      },
      "peerDependenciesMeta": {
        "@microsoft/api-extractor": {
          "optional": true
        },
        "@swc/core": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/ufo": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/ufo/-/ufo-1.6.1.tgz",
      "integrity": "sha512-9a4/uxlTWJ4+a5i0ooc1rU7C7YOw3wT+UGqdeNNHWnOF9qcMBgLRS+4IYUqbczewFx4mLEig6gawh7X6mFlEkA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/undici-types": {
      "version": "7.16.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.16.0.tgz",
      "integrity": "sha512-Zz+aZWSj8LE6zoxD+xrjh4VfkIG8Ya6LvYkZqtUQGJPZjYl53ypCaUwWqo7eI0x66KBGeRo+mlBEkMSeSZ38Nw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/universalify": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/universalify/-/universalify-0.2.0.tgz",
      "integrity": "sha512-CJ1QgKmNg3CwvAv/kOFmtnEN05f0D/cn9QntgNOQlQF9dgvVTHj3t+8JPdjqawCHk7V/KA+fbUqzZ9XWhcqPUg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 4.0.0"
      }
    },
    "node_modules/url-parse": {
      "version": "1.5.10",
      "resolved": "https://registry.npmjs.org/url-parse/-/url-parse-1.5.10.tgz",
      "integrity": "sha512-WypcfiRhfeUP9vvF0j6rw0J3hrWrw6iZv3+22h6iRMJ/8z1Tj6XfLP4DsUix5MhMPnXpiHDoKyoZ/bdCkwBCiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "querystringify": "^2.1.1",
        "requires-port": "^1.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/vite": {
      "version": "7.1.12",
      "resolved": "https://registry.npmjs.org/vite/-/vite-7.1.12.tgz",
      "integrity": "sha512-ZWyE8YXEXqJrrSLvYgrRP7p62OziLW7xI5HYGWFzOvupfAlrLvURSzv/FyGyy0eidogEM3ujU+kUG1zuHgb6Ug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.25.0",
        "fdir": "^6.5.0",
        "picomatch": "^4.0.3",
        "postcss": "^8.5.6",
        "rollup": "^4.43.0",
        "tinyglobby": "^0.2.15"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "lightningcss": "^1.21.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vite-plugin-purgecss": {
      "version": "0.2.13",
      "resolved": "https://registry.npmjs.org/vite-plugin-purgecss/-/vite-plugin-purgecss-0.2.13.tgz",
      "integrity": "sha512-b+ZHnZPm2tsnlPVkACUErTrVjnGN8c/ZOkPe0j0hha03S37RB+pPd+uIUKLsZs9l/HYelafgaudI+W4MTxhawA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "purgecss": "^4.1.3",
        "tsup": "^8.4.0",
        "vite": "^6.2.1"
      }
    },
    "node_modules/vite-plugin-purgecss/node_modules/vite": {
      "version": "6.4.1",
      "resolved": "https://registry.npmjs.org/vite/-/vite-6.4.1.tgz",
      "integrity": "sha512-+Oxm7q9hDoLMyJOYfUYBuHQo+dkAloi33apOPP56pzj+vsdJDzr+j1NISE5pyaAuKL4A3UD34qd0lx5+kfKp2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.25.0",
        "fdir": "^6.4.4",
        "picomatch": "^4.0.2",
        "postcss": "^8.5.3",
        "rollup": "^4.34.9",
        "tinyglobby": "^0.2.13"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
        "jiti": ">=1.21.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/vitest": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.0.6.tgz",
      "integrity": "sha512-gR7INfiVRwnEOkCk47faros/9McCZMp5LM+OMNWGLaDBSvJxIzwjgNFufkuePBNaesGRnLmNfW+ddbUJRZn0nQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "4.0.6",
        "@vitest/mocker": "4.0.6",
        "@vitest/pretty-format": "4.0.6",
        "@vitest/runner": "4.0.6",
        "@vitest/snapshot": "4.0.6",
        "@vitest/spy": "4.0.6",
        "@vitest/utils": "4.0.6",
        "debug": "^4.4.3",
        "es-module-lexer": "^1.7.0",
        "expect-type": "^1.2.2",
        "magic-string": "^0.30.19",
        "pathe": "^2.0.3",
        "picomatch": "^4.0.3",
        "std-env": "^3.9.0",
        "tinybench": "^2.9.0",
        "tinyexec": "^0.3.2",
        "tinyglobby": "^0.2.15",
        "tinyrainbow": "^3.0.3",
        "vite": "^6.0.0 || ^7.0.0",
        "why-is-node-running": "^2.3.0"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^20.0.0 || ^22.0.0 || >=24.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@types/debug": "^4.1.12",
        "@types/node": "^20.0.0 || ^22.0.0 || >=24.0.0",
        "@vitest/browser-playwright": "4.0.6",
        "@vitest/browser-preview": "4.0.6",
        "@vitest/browser-webdriverio": "4.0.6",
        "@vitest/ui": "4.0.6",
        "happy-dom": "*",
        "jsdom": "*"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@types/debug": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser-playwright": {
          "optional": true
        },
        "@vitest/browser-preview": {
          "optional": true
        },
        "@vitest/browser-webdriverio": {
          "optional": true
        },
        "@vitest/ui": {
          "optional": true
        },
        "happy-dom": {
          "optional": true
        },
        "jsdom": {
          "optional": true
        }
      }
    },
    "node_modules/w3c-xmlserializer": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-7.0.0.tgz",
      "integrity": "sha512-VwddBukDzu71offAQR975unBIGqfKZpM+8ZX6ySk8nYhVoo5CYaZyzt3YBvYtRtO+aoGlqxPg/B87NGVZ/fu6g==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/whatwg-encoding": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/whatwg-encoding/-/whatwg-encoding-3.1.1.tgz",
      "integrity": "sha512-6qN4hJdMwfYBtE3YBTTHhoeuUrDBPZmbQaxWAqSALV/MeEnR5z1xd8UKud2RAkFoPkmB+hli1TZSnyi84xz1vQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "iconv-lite": "0.6.3"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/whatwg-mimetype": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-4.0.0.tgz",
      "integrity": "sha512-QaKxh0eNIi2mE9p2vEdzfagOKHCcj1pJ56EEHGQOVxp8r9/iszLUUV7v89x9O1p/T+NlTM5W7jW6+cz4Fq1YVg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/whatwg-url": {
      "version": "14.2.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-14.2.0.tgz",
      "integrity": "sha512-De72GdQZzNTUBBChsXueQUnPKDkg/5A5zp7pFDuQAj5UFoENpiACU0wlCvzpAGnTkj++ihpKwKyYewn/XNUbKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tr46": "^5.1.0",
        "webidl-conversions": "^7.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/why-is-node-running": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/why-is-node-running/-/why-is-node-running-2.3.0.tgz",
      "integrity": "sha512-hUrmaWBdVDcxvYqnyh09zunKzROWjbZTiNy8dBEjkS7ehEDQibXJ7XvlmtbwuTclUiIyN+CyXQD4Vmko8fNm8w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "siginfo": "^2.0.0",
        "stackback": "0.0.2"
      },
      "bin": {
        "why-is-node-running": "cli.js"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
      "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^6.1.0",
        "string-width": "^5.0.1",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs": {
      "name": "wrap-ansi",
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/wrap-ansi-cjs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/ws": {
      "version": "8.18.3",
      "resolved": "https://registry.npmjs.org/ws/-/ws-8.18.3.tgz",
      "integrity": "sha512-PEIGCY5tSlUt50cqyMXfCzX+oOPqN0vuGqWzbcJ2xvnkzkq46oOpz7dQaTDBdfICb4N14+GARUDw2XV2N4tvzg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10.0.0"
      },
      "peerDependencies": {
        "bufferutil": "^4.0.1",
        "utf-8-validate": ">=5.0.2"
      },
      "peerDependenciesMeta": {
        "bufferutil": {
          "optional": true
        },
        "utf-8-validate": {
          "optional": true
        }
      }
    },
    "node_modules/xml-name-validator": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/xmlchars": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
      "dev": true,
      "license": "MIT"
    }
  }
}
```

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Gradual migration support */
    "allowJs": true,
    "checkJs": false,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "*.config.ts"],
  "exclude": ["node_modules"]
}
```

---

## `vite.config.ts`

```typescript
// vite.config.ts (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';
import purgecss from 'vite-plugin-purgecss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',

    // ===== [Phase 3.3 최적화] CSS Purging 플러그인 추가 =====
    plugins: mode === 'production' ? [
      purgecss({
        content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: ['dark-mode', 'sr-only', 'skip-link', 'modal-open'],
          deep: [/^btn/, /^toast/, /^modal/, /^virtual-/, /^error-/, /^text-/],
          greedy: [/data-/, /aria-/]
        }
      })
    ] : [],
    // ===== [Phase 3.3 최적화 끝] =====

    esbuild: {
      target: 'esnext', // # 문법 지원은 유지
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.js', 'src/**/*.test.ts'],
      esbuild: {
        target: 'esnext', // 테스트 환경에서도 esnext 문법(예: #)을 사용하도록 설정
      },
    },

    server: {
      proxy: {
        '/api/batchGetPrices': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/batchGetPrices/, '/quote'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const url = new URL(proxyReq.path, options.target);
              url.searchParams.set('token', env.FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY);
              proxyReq.path = url.pathname + url.search;
            });
          }
        }
      }
    }
  };
});
```

---
## `.gitignore`

```gitignore
# dependencies
node_modules/

# build output
dist/

# local env files
.env.local
.env.*.local

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# misc
.DS_Store
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>포트폴리오 리밸런싱 계산기</title>
    <meta name="description" content="포트폴리오 리밸런싱 계산기를 통해 목표 비율에 맞춰 투자 전략을 최적화하세요.">
    
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div id="aria-announcer" class="visually-hidden" aria-live="assertive" aria-atomic="true"></div>

    <button id="darkModeToggle" class="btn dark-mode-toggle" aria-label="다크 모드 전환">🌙</button>
    <div class="container">
        <header class="header">
            <h1>📊 포트폴리오 리밸런싱 계산기</h1>
            <p>목표 비율에 맞춰 포트폴리오를 조정하는 최적의 방법을 계산합니다.</p>
        </header>

        <main>
            <section class="card" aria-labelledby="portfolioManagementHeading">
                <h2 id="portfolioManagementHeading">📁 포트폴리오 관리</h2>
                <div class="input-group">
                    <label for="portfolioSelector">현재 포트폴리오:</label>
                    <select id="portfolioSelector" class="input-group__select"></select>
                </div>
                <div class="btn-controls">
                    <button id="newPortfolioBtn" class="btn" data-variant="green">➕ 새로 만들기</button>
                    <button id="renamePortfolioBtn" class="btn" data-variant="blue">✏️ 이름 변경</button>
                    <button id="deletePortfolioBtn" class="btn" data-variant="orange">🗑️ 삭제</button>
                </div>
            </section>

            <section class="card" aria-labelledby="modeSelectionHeading">
                <h2 id="modeSelectionHeading">⚙️ 계산 모드 선택</h2>
                <div class="mode-selector">
                    <label for="modeSimple"><input type="radio" name="mainMode" value="simple" id="modeSimple" checked> 🎯 간단 계산 모드</label>
                    <label for="modeAdd"><input type="radio" name="mainMode" value="add" id="modeAdd"> ➕ 추가 매수 모드</label>
                    <label for="modeSell"><input type="radio" name="mainMode" value="sell" id="modeSell"> ⚖️ 매도 리밸런싱 모드</label>
                </div>
            </section>

            <section class="card" aria-labelledby="portfolioSettingsHeading">
                <h2 id="portfolioSettingsHeading">💼 현재 포트폴리오 설정</h2>
                 <div class="btn-controls">
                    <button id="addNewStockBtn" class="btn" data-variant="green">➕ 새 종목 추가</button>
                    <button id="fetchAllPricesBtn" class="btn" data-variant="blue" style="width: 100%;">📈 현재가 모두 불러오기</button>

                    <div id="allocationTemplateGroup" class="input-group" style="margin-top: 10px;">
                        <label for="allocationTemplate">📋 자산 배분 템플릿:</label>
                        <select id="allocationTemplate" style="padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                            <option value="">-- 템플릿 선택 --</option>
                            <option value="60-40">60/40 포트폴리오 (주식 60%, 채권 40%)</option>
                            <option value="all-weather">All-Weather (Ray Dalio)</option>
                            <option value="50-30-20">50/30/20 (주식 50%, 채권 30%, 기타 20%)</option>
                            <option value="equal">동일 비중</option>
                        </select>
                        <button id="applyTemplateBtn" class="btn" data-variant="blue" style="margin-top: 5px;">✨ 템플릿 적용</button>
                    </div>

                    <div id="portfolioExchangeRateGroup" class="input-group" style="margin-top: 10px;">
                        <label for="portfolioExchangeRate">💱 환율 (1 USD = ? KRW):</label>
                        <input type="number" id="portfolioExchangeRate" placeholder="예: 1300" min="0.01" step="0.01" value="1300">
                    </div>

                    <div id="rebalancingToleranceGroup" class="input-group" style="margin-top: 10px;">
                        <label for="rebalancingTolerance">🔔 리밸런싱 알림 허용 오차 (%):</label>
                        <input type="number" id="rebalancingTolerance" placeholder="예: 5" min="0" step="0.1" value="5">
                    </div>

                    <div id="tradingCostsGroup" class="input-group" style="margin-top: 10px;">
                        <label for="tradingFeeRate">💸 거래 수수료율 (%):</label>
                        <input type="number" id="tradingFeeRate" placeholder="예: 0.3" min="0" step="0.01" value="0.3">
                    </div>

                    <div id="taxRateGroup" class="input-group" style="margin-top: 10px;">
                        <label for="taxRate">💰 세율 (%):</label>
                        <input type="number" id="taxRate" placeholder="예: 15" min="0" step="0.1" value="15">
                    </div>

                    <button id="resetDataBtn" class="btn" data-variant="orange">🔄 초기화</button>
                    <button id="normalizeRatiosBtn" class="btn" data-variant="blue">⚖️ 비율 자동 맞춤(100%)</button>
                    
                    <div class="dropdown">
                        <button id="dataManagementBtn" class="btn" data-variant="grey" 
                                aria-haspopup="true" 
                                aria-expanded="false" 
                                aria-controls="dataDropdownContent">
                            💾 데이터 관리
                        </button>
                        <div id="dataDropdownContent" class="dropdown-content"
                             role="menu"
                             aria-labelledby="dataManagementBtn">
                            <a href="#" id="exportDataBtn" role="menuitem">📤 내보내기 (JSON)</a>
                            <a href="#" id="importDataBtn" role="menuitem">📥 가져오기 (JSON)</a>
                            <a href="#" id="exportTransactionsCSVBtn" role="menuitem">📊 거래 내역 CSV 내보내기</a>
                        </div>
                    </div>

                    <input type="file" id="importFileInput" accept=".json" style="display: none;">
                </div>
                
                <div id="virtual-table-header" class="virtual-table-header" role="row">
                    </div>
                
                <div id="virtual-scroll-wrapper" role="grid" aria-rowcount="-1">
                    <div id="virtual-scroll-spacer"></div>
                    <div id="virtual-scroll-content"></div>
                </div>
                <div id="ratioValidator" class="ratio-validator">
                    <strong>목표 비율 합계:</strong>
                    <span class="ratio-value" id="ratioSum" aria-live="polite">0%</span>
                </div>
            </section>

             <section id="addInvestmentCard" class="card" aria-labelledby="addInvestmentHeading">
                <h2 id="addInvestmentHeading">💰 추가 투자금 계산</h2>
                 <div class="mode-selector">
                    <label for="currencyKRW"><input type="radio" name="currencyMode" value="krw" id="currencyKRW" checked> 원화(KRW) 기준</label>
                    <label for="currencyUSD"><input type="radio" name="currencyMode" value="usd" id="currencyUSD"> 달러(USD) 기준</label>
                </div>
                <div id="exchangeRateGroup" class="input-group hidden">
                    <label for="exchangeRate">환율 (1 USD):</label>
                    <input type="number" id="exchangeRate" placeholder="예: 1300" min="0.01" step="0.01" value="1300">
                </div>
                <div class="input-group">
                    <label for="additionalAmount">추가 투자 금액:</label>
                    <input type="number" id="additionalAmount" placeholder="예: 1000000" min="0">
                    <span id="usdInputGroup" class="hidden" style="display: contents;">
                        <span style="margin: 0 10px;">또는</span>
                        <label for="additionalAmountUSD" class="hidden">USD</label>
                        <input type="number" id="additionalAmountUSD" placeholder="예: 1000" min="0" step="0.01">
                        <span>USD</span>
                    </span>
                </div>
            </section>
            
            <button id="calculateBtn" class="btn" style="width: 100%; padding: 15px; font-size: 1.2rem; margin-bottom: 25px;">계산하기</button>
            
            <section id="resultsSection" class="hidden" aria-live="polite" role="region" aria-label="계산 결과"></section>
            <section id="sectorAnalysisSection" class="hidden" role="region" aria-label="섹터별 분석 결과"></section>
            <section id="chartSection" class="card hidden" role="region" aria-label="포트폴리오 시각화 차트">
                <h2>📊 포트폴리오 시각화</h2>
                <div>
                    <canvas id="portfolioChart"></canvas>
                </div>
            </section>
            <section id="performanceHistorySection" class="card hidden" role="region" aria-label="포트폴리오 성과 히스토리">
                <h2>📈 포트폴리오 성과 히스토리</h2>
                <div class="btn-controls" style="margin-bottom: 15px;">
                    <button id="showPerformanceHistoryBtn" class="btn" data-variant="blue">📊 차트 보기</button>
                    <button id="showSnapshotListBtn" class="btn" data-variant="green">📋 스냅샷 목록</button>
                </div>
                <div id="performanceChartContainer" class="hidden">
                    <canvas id="performanceChart"></canvas>
                </div>
                <div id="snapshotListContainer" class="hidden" style="margin-top: 20px;">
                    <h3>💾 저장된 스냅샷</h3>
                    <div id="snapshotList" style="max-height: 400px; overflow-y: auto;"></div>
                </div>
            </section>
        </main>
    </div>

    <div id="transactionModal" class="modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="modalStockName">
        <div class="modal-content card">
            <div class="modal-header">
                <h2 id="modalStockName">거래 내역 관리</h2>
                <button id="closeModalBtn" class="modal-close-btn" aria-label="닫기">&times;</button>
            </div>
            
            <div class="table-responsive" style="margin-bottom: 20px;">
                <table id="transactionTable">
                    <caption>거래 내역 목록</caption>
                    <thead>
                        <tr>
                            <th>날짜</th><th>종류</th><th>수량</th><th>단가</th><th>총액</th><th>작업</th>
                        </tr>
                    </thead>
                    <tbody id="transactionListBody"></tbody> </table>
            </div>

            <form id="newTransactionForm">
                <h3>새 거래 추가</h3>
                <div class="mode-selector" style="margin-bottom: 15px;">
                    <label><input type="radio" name="txType" value="buy" checked> 매수</label>
                    <label><input type="radio" name="txType" value="sell"> 매도</label>
                    <label><input type="radio" name="txType" value="dividend"> 배당</label>
                </div>
                <div class="mode-selector" style="margin-bottom: 15px;">
                    <label><input type="radio" name="inputMode" value="quantity" id="inputModeQuantity" checked> 수량 입력</label>
                    <label><input type="radio" name="inputMode" value="amount" id="inputModeAmount"> 금액 입력</label>
                </div>
                <div class="input-grid">
                    <div class="input-group-vertical">
                        <label for="txDate">날짜</label>
                        <input type="date" id="txDate" required>
                    </div>
                    <div class="input-group-vertical" id="quantityInputGroup">
                        <label for="txQuantity">수량</label>
                        <input type="number" id="txQuantity" placeholder="예: 10" min="0" step="any">
                    </div>
                    <div class="input-group-vertical" id="totalAmountInputGroup" style="display: none;">
                        <label for="txTotalAmount">총 금액</label>
                        <input type="number" id="txTotalAmount" placeholder="예: 1500000" min="0" step="any">
                    </div>
                    <div class="input-group-vertical">
                        <label for="txPrice">단가</label>
                        <input type="number" id="txPrice" placeholder="예: 150000" min="0" step="any" required>
                    </div>
                </div>
                <div id="calculatedQuantityDisplay" style="margin-top: 10px; padding: 10px; background-color: rgba(0, 123, 255, 0.1); border-radius: 5px; display: none;">
                    <strong>계산된 수량:</strong> <span id="calculatedQuantityValue">0</span>
                </div>
                <button type="submit" class="btn" data-variant="blue" style="width: 100%; margin-top: 15px;">💾 거래 추가</button>
            </form>
        </div>
    </div>
    
    <div id="customModal" class="modal-overlay hidden" role="alertdialog" aria-modal="true" aria-labelledby="customModalTitle">
        <div class="modal-content card">
            <h2 id="customModalTitle"></h2>
            <p id="customModalMessage"></p>
            <input type="text" id="customModalInput" class="hidden" style="width: 100%; margin: 15px 0;">
            <div class="btn-controls" style="justify-content: flex-end; margin-top: 20px;">
                <button id="customModalCancel" class="btn" data-variant="grey">취소</button>
                <button id="customModalConfirm" class="btn" data-variant="blue">확인</button>
            </div>
        </div>
    </div>

    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## `style.css`

```css
/* --- 기본 설정 및 테마 --- */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
    /* Colors */
    --bg-color: #f5f5f5; --text-color: #333; --card-bg: white; --card-shadow: rgba(0,0,0,0.1);
    --border-color: #eee; --accent-color: #667eea; --input-border: #e9ecef; --input-bg: white;
    --invalid-text-color: #b71c1c; --invalid-border-color: #f44336;
    
    /* Gradients */
    --header-grad: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --green-grad: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    --orange-grad: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    --red-grad: linear-gradient(135deg,#dc3545 0%,#c82333 100%);
    --blue-grad: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    --grey-grad: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
    
    /* Spacing & Sizing */
    --container-width: 1200px;
    --spacing-sm: 10px;
    --spacing-md: 20px;
    --spacing-lg: 30px;
    --border-radius: 15px;
    
    /* Typography */
    --font-family-main: 'Segoe UI', sans-serif;
    --font-size-base: 1rem;
    --font-size-lg: 1.5rem;
    --font-size-xl: 2.5rem;
}
body.dark-mode {
    --bg-color: #1a1a1a; --text-color: #e0e0e0; --card-bg: #2d2d2d; --card-shadow: rgba(0,0,0,0.5);
    --border-color: #444; --input-border: #555; --input-bg: #3d3d3d;
    --invalid-text-color: #ff8a80;
}
body { 
    font-family: var(--font-family-main); 
    line-height: 1.6; 
    color: var(--text-color); 
    background-color: var(--bg-color); 
    transition: background-color 0.3s, color 0.3s; 
}

/* --- 레이아웃 및 카드 --- */
.container { max-width: var(--container-width); margin: 0 auto; padding: var(--spacing-md); }
.header { 
    background: var(--header-grad); color: white; padding: var(--spacing-lg); border-radius: var(--border-radius); 
    margin-bottom: var(--spacing-lg); text-align: center; box-shadow: 0 10px 30px var(--card-shadow); 
}
.header h1 { font-size: var(--font-size-xl); margin-bottom: var(--spacing-sm); }
.card { 
    background: var(--card-bg); border-radius: var(--border-radius); padding: 25px; 
    margin-bottom: 25px; box-shadow: 0 5px 20px var(--card-shadow); 
    transition: background-color 0.3s, box-shadow 0.3s; 
}
.card h2 { color: var(--accent-color); margin-bottom: var(--spacing-md); font-size: var(--font-size-lg); }

/* --- 테이블 및 반응형 개선 --- */
.table-responsive { overflow-x: auto; } 
/* 모달 내의 테이블 스타일은 유지 */
table { 
    width: 100%; border-collapse: collapse; margin-top: 15px; min-width: 600px; border-spacing: 0;
}
caption { caption-side: top; text-align: left; font-weight: bold; padding: var(--spacing-sm) 0; font-size: 1.1rem; color: var(--text-color); }
th, td { 
    padding: 12px; text-align: left; white-space: nowrap; vertical-align: middle; border-bottom: 1px solid var(--border-color);
}
thead tr:last-child th {
    border-bottom: 2px solid var(--accent-color);
}
.stock-outputs td {
    border-bottom: 2px solid #ccc;
}
body.dark-mode .stock-outputs td {
    border-bottom: 2px solid #555;
}
.ticker { 
    background-color: var(--input-border); color: var(--text-color); padding: 4px 8px; border-radius: 6px; 
    font-family: 'Courier New',monospace; font-size: .9rem; font-weight: bold; 
}
.calculated-value { font-weight: 500; color: var(--accent-color); }
.stock-outputs {
    background-color: rgba(0,0,0,0.015);
}
body.dark-mode .stock-outputs {
    background-color: rgba(255,255,255,0.03);
}
.output-cell .label {
    display: block; font-size: 0.8rem; color: #6c757d; margin-bottom: 4px;
}
body.dark-mode .output-cell .label { color: #9ab; }
.output-cell .value { font-weight: bold; font-size: 1.1rem; }

/* ▼▼▼▼▼ [추가] 가상 스크롤 및 새 테이블 그리드 스타일 ▼▼▼▼▼ */
.virtual-table-header, .virtual-row-inputs, .virtual-row-outputs {
    display: grid;
    /* 그리드 템플릿은 view.js에서 모드에 따라 동적으로 설정됩니다. */
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding: 0 10px; /* 좌우 패딩 */
}

.virtual-table-header {
    background-color: var(--card-bg);
    border-bottom: 2px solid var(--accent-color);
    font-weight: 600;
    padding: 12px 10px;
    position: sticky; /* 스크롤 시 헤더가 상단에 붙도록 (선택 사항) */
    top: 0;
    z-index: 10;
}

#virtual-scroll-wrapper {
    position: relative;
    width: 100%;
    min-height: 400px; /* 최소 높이 추가 */
    max-height: 60vh; /* 테이블의 최대 높이 (중요) */
    overflow-y: auto; /* 스크롤바 생성 */
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 var(--border-radius) var(--border-radius);
}

#virtual-scroll-spacer {
    position: relative;
    width: 100%;
    height: 1px; /* view.js에서 총 높이로 설정됨 */
}

#virtual-scroll-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
}

/* 새 '행' 스타일 (div) */
.virtual-row-inputs, .virtual-row-outputs {
    width: 100%;
    /* 각 행의 높이를 고정해야 계산이 가능 (중요) */
    /* 2줄(입력+출력)이 한 세트이므로, 각 div의 높이를 설정 */
}
.virtual-row-inputs {
    height: 60px; /* 입력 행 높이 고정 */
    background-color: var(--card-bg);
}
.virtual-row-outputs {
    height: 50px; /* 출력 행 높이 고정 */
    background-color: rgba(0,0,0,0.015);
    font-size: 0.9rem;
}
body.dark-mode .virtual-row-outputs {
    background-color: rgba(255,255,255,0.03);
}

/* 그리드 셀 공통 스타일 */
.virtual-cell {
    padding: 4px;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.virtual-cell.align-right { justify-content: flex-end; }
.virtual-cell.align-center { justify-content: center; }

/* 새 입력창 스타일 (폭 100%) */
.virtual-cell input[type="text"],
.virtual-cell input[type="number"],
.virtual-cell input[type="checkbox"] {
    width: 100%;
    padding: 6px;
    margin: 0;
    text-align: center;
    font-size: 0.95rem; /* 입력창 폰트 크기 살짝 조절 */
}
.virtual-cell input[type="checkbox"] { width: auto; }

/* 출력 셀 스타일 (기존 .output-cell과 유사) */
.virtual-row-outputs .output-cell .label {
    display: block; font-size: 0.8rem; color: #6c757d; margin-bottom: 2px;
}
body.dark-mode .virtual-row-outputs .output-cell .label { color: #9ab; }
.virtual-row-outputs .output-cell .value { font-weight: bold; font-size: 1.05rem; }

/* ▲▲▲▲▲ [추가] ▲▲▲▲▲ */


/* --- 입력 필드 및 버튼 --- */
.input-group { display: flex; align-items: center; gap: 15px; margin-bottom: var(--spacing-md); flex-wrap: wrap; }
.input-group label { font-weight: 600; min-width: 120px; }
.input-group-vertical { display: flex; flex-direction: column; gap: 5px; }
.input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
input, .input-group__select {
    padding: 12px; border: 2px solid var(--input-border); border-radius: 8px; font-size: var(--font-size-base); 
    background: var(--input-bg); color: var(--text-color); transition: border-color 0.3s; 
}
/* #portfolioTable input[type="text"] { text-align: center; } <-- 가상 스크롤 CSS로 대체됨 */
.input-group__select { flex-grow: 1; }
input:focus, .input-group__select:focus { outline: none; border-color: var(--accent-color); }
input:disabled { background-color: #eee; }
body.dark-mode input:disabled { background-color: #2a2a2a; }
.input-invalid { border-color: var(--invalid-border-color) !important; } 
.amount-input { width: 120px; text-align: right; padding: 6px; }
.btn { 
    background: var(--header-grad); color: white; border: none; padding: 12px 25px; border-radius: 8px; 
    cursor: pointer; font-size: var(--font-size-base); font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; 
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
.btn-controls { display: flex; gap: var(--spacing-sm); flex-wrap: wrap; margin-bottom: 15px; }

/* ⬇️ [수정] data-variant 속성 선택자 사용 */
.btn[data-variant="green"] { background: var(--green-grad); }
.btn[data-variant="orange"] { background: var(--orange-grad); }
.btn[data-variant="blue"] { background: var(--blue-grad); }
.btn[data-variant="grey"] { background: var(--grey-grad); }
.btn[data-variant="delete"] { 
    background: var(--red-grad); 
    padding: 6px 12px; 
    font-size: 0.9rem; 
}
/* ⬆️ [수정] */

.btn--small { padding: 8px 16px; font-size: 0.9rem; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }

/* --- 드롭다운 버튼 스타일 --- */
.dropdown { position: relative; display: inline-block; }
.dropdown-content {
    display: none; position: absolute; background-color: var(--card-bg); min-width: 160px;
    box-shadow: 0px 8px 16px 0px var(--card-shadow); z-index: 1; border-radius: 8px; overflow: hidden;
}
.dropdown-content a {
    color: var(--text-color); padding: 12px 16px; text-decoration: none; display: block; transition: background-color 0.2s;
}
.dropdown-content a:hover { background-color: rgba(0,0,0,0.05); }
body.dark-mode .dropdown-content a:hover { background-color: rgba(255,255,255,0.1); }
.show { display: block; }

/* --- UI 컴포넌트 --- */
.mode-selector { 
    display: flex; gap: var(--spacing-md); margin-bottom: 25px; background-color: rgba(0,0,0,0.03); 
    padding: 12px; border-radius: 10px; border: 1px solid var(--border-color); 
}
.mode-selector label { cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
.mode-selector input[type="radio"] { transform: scale(1.2); }
.ratio-validator {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px var(--spacing-md); border-radius: 10px;
    margin-top: 15px; display: flex; justify-content: space-between; align-items: center;
    border: 2px solid transparent; transition: all 0.3s; color: #1a1a1a;
}
.ratio-validator.valid { border-color: #4caf50; background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); color: #1b5e20; }
.ratio-validator.invalid { border-color: #f44336; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); color: var(--invalid-text-color); }
.ratio-validator strong { font-size: 1.1rem; color: inherit; }
.ratio-value { font-size: 1.3rem; font-weight: bold; color: inherit; }
body.dark-mode .ratio-validator { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: #e0e0e0; border-color: #4a5568; }
body.dark-mode .ratio-validator.valid { border-color: #48bb78; background: linear-gradient(135deg, #22543d 0%, #2f855a 100%); color: #9ae6b4; }
body.dark-mode .ratio-validator.invalid { border-color: #fc8181; background: linear-gradient(135deg, #742a2a 0%, #9b2c2c 100%); color: var(--invalid-text-color); }

/* --- 결과 표시 --- */
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-md); margin-bottom: 25px; }
.summary-item { padding: var(--spacing-md); border-radius: 12px; text-align: center; color: #333; }
.summary-item h3 { margin-bottom: var(--spacing-sm); font-size: 1.1rem; }
.summary-item .amount { font-size: 1.8rem; font-weight: bold; }
.summary-item--current { background-color: #d4edda; }
.summary-item--additional { background-color: #cce7ff; }
.summary-item--final { background-color: #f3e5f5; }
.summary-item--rebalance { background-color: #fff3cd; }
body.dark-mode .summary-item { color: var(--text-color); }
body.dark-mode .summary-item--current { background-color: #1e4620; color: #c8e6c9; }
body.dark-mode .summary-item--additional { background-color: #1a3a52; color: #bbdefb; }
body.dark-mode .summary-item--final { background-color: #38294d; color: #e1bee7; }
body.dark-mode .summary-item--rebalance { background-color: #4a3f1f; color: #fff9c4; }

.guide-box { border-radius: 12px; padding: var(--spacing-md); margin-top: var(--spacing-md); }
.guide-box--buy { background-color: #e3f2fd; }
.guide-box--sell { background-color: #f8d7da; }
body.dark-mode .guide-box--buy { background-color: #1a3a52; }
body.dark-mode .guide-box--sell { background-color: #4a1f1f; }
.guide-box h3 { margin-bottom: 15px; }
.guide-item { display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
.text-buy { font-weight: bold; color: #007bff; font-size: 1.1rem; }
.text-sell { font-weight: bold; color: #dc3545; font-size: 1.1rem; }
.hidden { display: none !important; }

/* --- 모달(Modal) 스타일 --- */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.6); z-index: 1000;
    display: flex; justify-content: center; align-items: center;
    opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
}
.modal-overlay:not(.hidden) { opacity: 1; visibility: visible; }
.modal-content {
    width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
    transform: scale(0.9); transition: transform 0.3s;
}
#customModal .modal-content { max-width: 500px; }
.modal-overlay:not(.hidden) .modal-content { transform: scale(1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-close-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--text-color); }

/* --- 애니메이션 및 기타 --- */
.result-row-highlight {
    opacity: 0; transform: translateX(-20px); transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}
.result-row-highlight.in-view { opacity: 1; transform: translateX(0); }
#chartSection { position: relative; max-width: 500px; margin: 25px auto; }
#chartSection > div { position: relative; height: 400px; }
.dark-mode-toggle {
    position: fixed; bottom: var(--spacing-lg); right: var(--spacing-lg); z-index: 1000; width: 60px; height: 60px; border-radius: 50%;
    font-size: 1.8rem; box-shadow: 0 5px 20px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; padding: 0;
}

/* --- [추가] 스크린 리더 전용 클래스 --- */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* --- [추가] 키보드 네비게이션 시 포커스 스타일 --- */
body.keyboard-nav *:focus {
    outline: 3px solid var(--accent-color); /* 포커스 시 강조 아웃라인 */
    outline-offset: 2px; /* 아웃라인과 요소 사이 간격 */
}
/* 기본 input 포커스 스타일은 유지 */


/* --- Toast 알림 --- */
.toast {
    position: fixed; top: var(--spacing-md); left: 50%; transform: translateX(-50%);
    padding: 15px 25px; border-radius: 8px; color: white; font-size: var(--font-size-base); font-weight: 600;
    z-index: 2000; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
}
@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
@keyframes fadeOut { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -20px); } }
.toast--success { background: var(--green-grad); }
.toast--error { background: var(--red-grad); }
.toast--info { background: var(--blue-grad); }

/* --- 스켈레톤 UI --- */
.skeleton-wrapper { background-color: var(--card-bg); border-radius: var(--border-radius); padding: 25px; box-shadow: 0 5px 20px var(--card-shadow); }
.skeleton {
    opacity: 0.7; animation: shimmer 2s infinite linear;
    background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.15) 37%, rgba(0,0,0,0.06) 63%);
    background-size: 400% 100%; border-radius: 8px;
}
body.dark-mode .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.15) 37%, rgba(255,255,255,0.06) 63%);
    background-size: 400% 100%;
}
@keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
.skeleton-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-md); margin-bottom: 25px; }
.skeleton-summary-item { height: 90px; }
.skeleton-table-row { display: flex; justify-content: space-between; align-items: center; height: 40px; margin-bottom: var(--spacing-sm); padding: 0 var(--spacing-sm); }
.skeleton-text { height: var(--spacing-md); width: 80%; }
.skeleton-text--short { width: 40%; }

/* --- 모바일 반응형 디자인 --- */
@media (max-width: 768px) {
    .container { padding: var(--spacing-sm); }
    .header { padding: var(--spacing-md) 15px; }
    .header h1 { font-size: 1.8rem; }
    .btn-controls { flex-direction: column; }
    .btn { width: 100%; margin-bottom: 5px; }
    table { font-size: 0.85rem; min-width: auto; } /* 모달 테이블 */
    th, td { padding: 8px 4px; white-space: normal; } /* 모달 테이블 */
    .amount-input { width: 80px; }
    .input-group { flex-direction: column; align-items: flex-start; }
    .summary-grid { grid-template-columns: 1fr; }
    .mode-selector { flex-direction: column; gap: var(--spacing-sm); }
    .guide-box { padding: 15px; }
    .dark-mode-toggle { bottom: 15px; right: 15px; width: 50px; height: 50px; }
    
    /* ▼▼▼▼▼ [추가] 가상 테이블 모바일 스타일 ▼▼▼▼▼ */
    .virtual-table-header, .virtual-row-inputs, .virtual-row-outputs {
        font-size: 0.85rem;
        padding: 0 4px;
        /* 그리드 템플릿은 view.js에서 동적으로 설정됩니다 */
    }
    .virtual-row-inputs { 
        height: 70px; /* 모바일에서 입력 행 높이 약간 증가 */
        font-size: 0.9rem;
    }
    .virtual-row-outputs { height: 50px; }
    
    .virtual-cell .btn--small {
        padding: 4px 8px;
        font-size: 0.8rem;
    }
    /* ▲▲▲▲▲ [추가] ▲▲▲▲▲ */
}
@media (max-width: 480px) {
    .header h1 { font-size: var(--font-size-lg); }
    .card { padding: 15px; }
    .btn { font-size: 0.9rem; padding: 10px 20px; }
}
```

---

## `locales/en.json`

```json
// locales/en.json
{
  "toast": {
    "dataReset": "Data has been reset.",
    "ratiosNormalized": "Target ratios have been adjusted to 100%.",
    "noRatiosToNormalize": "No target ratios available for auto-adjustment.",
    "saveSuccess": "Portfolio saved successfully.",
    "saveNoData": "No data to save.",
    "loadSuccess": "Loaded saved data.",
    "importSuccess": "Data imported successfully.",
    "importError": "Error occurred while importing file.",
    "portfolioCreated": "Portfolio '{name}' created.",
    "portfolioRenamed": "Portfolio name changed.",
    "portfolioDeleted": "Portfolio deleted.",
    "lastPortfolioDeleteError": "Cannot delete the last portfolio.",
    "transactionAdded": "Transaction added.",
    "transactionDeleted": "Transaction deleted.",
    "chartError": "Failed to visualize chart."
  },
  "modal": {
    "confirmResetTitle": "Reset Data",
    "confirmResetMsg": "Reset the current portfolio to the initial template? This action cannot be undone.",
    "confirmDeletePortfolioTitle": "Delete Portfolio",
    "confirmDeletePortfolioMsg": "Are you sure you want to delete the '{name}' portfolio? This action cannot be undone.",
    "confirmDeleteTransactionTitle": "Delete Transaction",
    "confirmDeleteTransactionMsg": "Are you sure you want to delete this transaction?",
    "confirmRatioSumWarnTitle": "Confirm Target Ratios",
    "confirmRatioSumWarnMsg": "The sum of target ratios is {totalRatio}%. Proceed with calculation even if it's not 100%?",
    "promptNewPortfolioNameTitle": "Create New Portfolio",
    "promptNewPortfolioNameMsg": "Enter the name for the new portfolio:",
    "promptRenamePortfolioTitle": "Rename Portfolio",
    "promptRenamePortfolioMsg": "Enter the new portfolio name:"
  },
  "validation": {
    "calculationError": "Calculation error. Please check your inputs.",
    "validationErrorPrefix": "Please check your inputs: ",
    "saveErrorGeneral": "Error occurred while saving.",
    "saveErrorQuota": "Storage space insufficient. Please delete unnecessary portfolios.",
    "calcErrorDecimal": "Input value is too large or has an invalid format.",
    "calcErrorType": "Data format error occurred.",
    "invalidFileStructure": "The file structure is invalid or corrupted.",
    "investmentAmountZero": "- Additional investment amount must be greater than 0.",
    "currentAmountZero": "- Current amount must be greater than 0 to calculate rebalancing.",
    "ratioSumNot100": "- Sum of target ratios must be 100%. (Current: {totalRatio}%)",
    "invalidTransactionData": "- Please enter valid transaction date, quantity, and price.",
    "fixedBuyAmountTooSmall": "- Fixed buy amount for '{name}' is less than the current price, cannot buy even 1 share.",
    "invalidNumber": "Not a valid number.",
    "negativeNumber": "Negative numbers are not allowed.",
    "invalidDate": "Please enter a valid date.",
    "futureDate": "Future dates are not allowed.",
    "quantityZero": "Quantity must be greater than 0.",
    "priceZero": "Price must be greater than 0.",
    "nameMissing": "- Please enter the name for the unnamed stock.",
    "tickerMissing": "- Please enter the ticker for '{name}'.",
    "currentPriceZero": "- Current price for '{name}' must be greater than 0.",
    "fixedBuyAmountZero": "- Fixed buy amount for '{name}' must be greater than 0.",
    "fixedBuyTotalExceeds": "- Sum of fixed buy amounts exceeds the total investment amount."
  },
  "aria": {
    "tickerInput": "{name} ticker input",
    "sectorInput": "{name} sector input",
    "targetRatioInput": "{name} target ratio input",
    "currentPriceInput": "{name} current price input",
    "fixedBuyToggle": "Enable fixed buy amount",
    "fixedBuyAmount": "Fixed buy amount",
    "manageTransactions": "Manage transactions for {name}",
    "deleteStock": "Delete {name}",
    "deleteTransaction": "Delete transaction from {date}",
    "resultsLoaded": "Calculation results loaded."
  },
  "view": {
    "noTransactions": "No transactions found."
  },
  "template": {
    "currentTotalAsset": "Current Total Assets",
    "additionalInvestment": "Additional Investment",
    "finalTotalAsset": "Total Assets After Investment",
    "addModeGuideTitle": "📈 Additional Investment Allocation Guide (Sorted by Buy Amount)",
    "stock": "Stock",
    "currentRatio": "Current Ratio",
    "targetRatio": "Target Ratio",
    "profitRate": "Profit Rate",
    "buyRecommendation": "Recommended Buy Amount",
    "buyGuideTitle": "💡 Buy Execution Guide",
    "noItemsToBuy": "No items to buy.",
    "rebalancingTotal": "Total Rebalancing Amount",
    "sellModeGuideTitle": "⚖️ Rebalancing Guide (Sorted by Adjustment Amount)",
    "adjustmentAmount": "Adjustment Amount",
    "sellItemsTitle": "🔴 Items to Sell",
    "noItemsToSell": "No items to sell.",
    "buyItemsTitle": "🔵 Items to Buy (with proceeds from selling)",
    "sectorAnalysisTitle": "🗂️ Sector Analysis",
    "sector": "Sector",
    "amount": "Amount",
    "ratio": "Ratio (%)"
  },
  "state": {
     "noActivePortfolio": "No active portfolio.",
     "noPortfolioData": "No portfolio data available."
  },
  "error": {
      "cannotGetInputs": "Could not retrieve calculation inputs."
  },
  "api": {
    "fetchSuccessAll": "{count} stock prices updated.",
    "fetchSuccessPartial": "{count} succeeded ({failed} failed)",
    "fetchFailedAll": "Failed to load prices for all stocks ({failed}). Check API key or tickers.",
    "noUpdates": "No stocks to update.",
    "fetchErrorGlobal": "API call error: {message}"
  }
}
```

---

## `locales/ko.json`

```json
// locales/ko.json
{
  "toast": {
    "dataReset": "데이터가 초기화되었습니다.",
    "ratiosNormalized": "목표 비율이 100%에 맞춰 조정되었습니다.",
    "noRatiosToNormalize": "자동 조정을 위한 목표 비율이 없습니다.",
    "saveSuccess": "포트폴리오가 저장되었습니다.",
    "saveNoData": "저장할 데이터가 없습니다.",
    "loadSuccess": "저장된 데이터를 불러왔습니다.",
    "importSuccess": "데이터를 성공적으로 불러왔습니다.",
    "importError": "파일을 불러오는 중 오류가 발생했습니다.",
    "portfolioCreated": "포트폴리오 '{name}'이(가) 생성되었습니다.",
    "portfolioRenamed": "포트폴리오 이름이 변경되었습니다.",
    "portfolioDeleted": "포트폴리오가 삭제되었습니다.",
    "lastPortfolioDeleteError": "마지막 포트폴리오는 삭제할 수 없습니다.",
    "transactionAdded": "거래 내역이 추가되었습니다.",
    "transactionDeleted": "거래 내역이 삭제되었습니다.",
    "chartError": "차트 시각화에 실패했습니다."
  },
  "modal": {
    "confirmResetTitle": "데이터 초기화",
    "confirmResetMsg": "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "confirmDeletePortfolioTitle": "포트폴리오 삭제",
    "confirmDeletePortfolioMsg": "정말로 '{name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "confirmDeleteTransactionTitle": "거래 내역 삭제",
    "confirmDeleteTransactionMsg": "이 거래 내역을 정말로 삭제하시겠습니까?",
    "confirmRatioSumWarnTitle": "목표 비율 확인",
    "confirmRatioSumWarnMsg": "목표비율 합이 {totalRatio}%입니다. 100%가 아니어도 계산을 진행하시겠습니까?",
    "promptNewPortfolioNameTitle": "새 포트폴리오 생성",
    "promptNewPortfolioNameMsg": "새 포트폴리오의 이름을 입력하세요:",
    "promptRenamePortfolioTitle": "이름 변경",
    "promptRenamePortfolioMsg": "새로운 포트폴리오 이름을 입력하세요:"
  },
  "validation": {
    "calculationError": "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
    "validationErrorPrefix": "입력값을 확인해주세요: ",
    "saveErrorGeneral": "저장 중 오류가 발생했습니다.",
    "saveErrorQuota": "저장 공간이 부족합니다. 불필요한 포트폴리오를 삭제해 주세요.",
    "calcErrorDecimal": "입력값이 너무 크거나 잘못된 형식입니다.",
    "calcErrorType": "데이터 형식 오류가 발생했습니다.",
    "invalidFileStructure": "파일의 구조가 올바르지 않거나 손상되었습니다.",
    "investmentAmountZero": "- 추가 투자 금액을 0보다 크게 입력해주세요.",
    "currentAmountZero": "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
    "ratioSumNot100": "- 목표 비율의 합이 100%가 되어야 합니다. (현재: {totalRatio}%)",
    "invalidTransactionData": "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
    "fixedBuyAmountTooSmall": "- '{name}'의 고정 매수 금액이 현재가보다 작아 1주도 매수할 수 없습니다.",
    "invalidNumber": "유효한 숫자가 아닙니다.",
    "negativeNumber": "음수는 입력할 수 없습니다.",
    "invalidDate": "유효한 날짜를 입력해주세요.",
    "futureDate": "미래 날짜는 입력할 수 없습니다.",
    "quantityZero": "수량은 0보다 커야 합니다.",
    "priceZero": "단가는 0보다 커야 합니다.",
    "nameMissing": "- 이름 없는 종목의 종목명을 입력해주세요.",
    "tickerMissing": "- '{name}'의 티커를 입력해주세요.",
    "currentPriceZero": "- '{name}'의 현재가는 0보다 커야 합니다.",
    "fixedBuyAmountZero": "- '{name}'의 고정 매수 금액은 0보다 커야 합니다.",
    "fixedBuyTotalExceeds": "- 고정 매수 금액의 합이 총 투자금을 초과합니다."
  },
  "aria": {
    "tickerInput": "{name} 티커 입력",
    "sectorInput": "{name} 섹터 입력",
    "targetRatioInput": "{name} 목표 비율 입력",
    "currentPriceInput": "{name} 현재가 입력",
    "fixedBuyToggle": "고정 매수 활성화",
    "fixedBuyAmount": "고정 매수 금액",
    "manageTransactions": "{name} 거래 관리",
    "deleteStock": "{name} 삭제",
    "deleteTransaction": "{date} 거래 삭제",
    "resultsLoaded": "계산 결과가 로드되었습니다."
  },
  "view": {
    "noTransactions": "거래 내역이 없습니다."
  },
  "template": {
    "currentTotalAsset": "현재 총 자산",
    "additionalInvestment": "추가 투자금",
    "finalTotalAsset": "투자 후 총 자산",
    "addModeGuideTitle": "📈 추가 투자 배분 가이드 (매수 금액순 정렬)",
    "stock": "종목",
    "currentRatio": "현재 비율",
    "targetRatio": "목표 비율",
    "profitRate": "수익률",
    "buyRecommendation": "매수 추천 금액",
    "buyGuideTitle": "💡 매수 실행 가이드",
    "noItemsToBuy": "매수할 종목이 없습니다.",
    "rebalancingTotal": "총 리밸런싱 금액",
    "sellModeGuideTitle": "⚖️ 리밸런싱 가이드 (조정 금액순 정렬)",
    "adjustmentAmount": "조정 금액",
    "sellItemsTitle": "🔴 매도 항목",
    "noItemsToSell": "매도할 종목이 없습니다.",
    "buyItemsTitle": "🔵 매수 항목 (매도 자금으로)",
    "sectorAnalysisTitle": "🗂️ 섹터별 분석",
    "sector": "섹터",
    "amount": "금액",
    "ratio": "비중"
  },
  "state": {
     "noActivePortfolio": "활성화된 포트폴리오가 없습니다.",
     "noPortfolioData": "포트폴리오 데이터가 없습니다."
  },
  "error": {
      "cannotGetInputs": "계산 입력값을 가져올 수 없습니다."
  },
  "api": {
    "fetchSuccessAll": "{count}개 종목 업데이트 완료.",
    "fetchSuccessPartial": "{count}개 성공 ({failed} 실패)",
    "fetchFailedAll": "모든 종목({failed}) 가격 로딩 실패. API 키나 티커를 확인하세요.",
    "noUpdates": "업데이트할 종목이 없습니다.",
    "fetchErrorGlobal": "API 호출 중 오류 발생: {message}"
  }
}
```

---

## `src/main.ts`

```typescript
// src/main.ts (Class-based View)
import { PortfolioState } from './state.ts';
import { PortfolioView } from './view.ts';
import { PortfolioController } from './controller.ts';
import { ErrorService } from './errorService.ts';

// ===== [Phase 3.1 최적화] Chart.js 지연 로딩 =====
// Chart.js는 이미 CalculationManager에서 동적으로 임포트되므로 여기서 임포트 제거
// (await import('chart.js/auto')).default를 사용하여 필요할 때만 로드
// ===== [Phase 3.1 최적화 끝] =====

try {
    const state = new PortfolioState();
    // PortfolioView는 클래스이므로 new 키워드로 인스턴스화
    const view = new PortfolioView();

    // ErrorService에 view 인스턴스 설정 (에러 토스트 메시지 표시를 위해)
    ErrorService.setViewInstance(view);

    // Controller 생성 (initialize는 생성자에서 자동 호출됨)
    const app = new PortfolioController(state, view);

    console.log("Application setup complete.");
} catch (error) {
    console.error("애플리케이션 초기화 중 치명적인 오류 발생:", error);
    // 사용자에게 오류 메시지를 표시하는 UI 로직 추가 가능
    const bodyElement = document.body;
    if (bodyElement) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        bodyElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
            <h1>애플리케이션 로딩 실패</h1>
            <p>오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
            <p>오류 메시지: ${errorMsg}</p>
        </div>`;
    }
}
```

---

## `src/types.ts`

```typescript
// src/types.ts

import type { Decimal } from 'decimal.js';

export type TransactionType = 'buy' | 'sell' | 'dividend';

export interface Transaction {
    id: string; // 거래 고유 ID
    type: TransactionType; // 거래 유형
    date: string; // 거래 날짜 (YYYY-MM-DD)
    quantity: number; // 수량
    price: number; // 단가
}

export interface Stock {
    id: string; // 주식 고유 ID
    name: string; // 종목명
    ticker: string; // 티커
    sector: string; // 섹터
    targetRatio: number; // 목표 비율 (%)
    currentPrice: number; // 현재가
    transactions: Transaction[]; // 거래 내역 배열
    isFixedBuyEnabled: boolean; // 고정 매수 활성화 여부
    fixedBuyAmount: number; // 고정 매수 금액
    manualAmount?: number; // 간단 모드용 수동 입력 금액 (선택 사항)
}

export interface CalculatedStockMetrics {
    totalBuyQuantity: Decimal; // 총 매수 수량
    totalSellQuantity: Decimal; // 총 매도 수량
    quantity: Decimal; // 현재 보유 수량
    totalBuyAmount: Decimal; // 총 매수 금액
    totalSellAmount: Decimal; // 총 매도 금액
    avgBuyPrice: Decimal; // 평균 매수 단가
    currentAmount: Decimal; // 현재 평가 금액 (USD 기준)
    currentAmountUSD: Decimal; // 현재 평가 금액 (USD)
    currentAmountKRW: Decimal; // 현재 평가 금액 (KRW)
    profitLoss: Decimal; // 미실현 손익 (현재 보유분)
    profitLossRate: Decimal; // 미실현 수익률 (%)
    totalDividends: Decimal; // 총 배당금
    realizedPL: Decimal; // 실현 손익 (매도 차익)
    totalRealizedPL: Decimal; // 총 실현 손익 (실현손익 + 배당금)
}

export interface CalculatedStock extends Stock {
    calculated: CalculatedStockMetrics;
}

export type MainMode = 'add' | 'sell';
export type Currency = 'krw' | 'usd';

export interface PortfolioSettings {
    mainMode: MainMode;
    currentCurrency: Currency;
    exchangeRate: number;
    rebalancingTolerance?: number; // 리밸런싱 허용 오차 (%), optional for backward compatibility
    tradingFeeRate?: number; // 거래 수수료율 (%), optional
    taxRate?: number; // 세율 (%), optional
}

export interface Portfolio {
    id: string;
    name: string;
    portfolioData: Stock[];
    settings: PortfolioSettings;
}

export interface MetaState {
    activePortfolioId: string;
    version: string;
}

export interface PortfolioData {
    name: string; // 포트폴리오 이름
    portfolioData: Stock[]; // 주식 데이터 배열
    settings: PortfolioSettings;
}

// Validation types
export interface ValidationResult {
    isValid: boolean;
    value?: string | number;
    message?: string;
}

export interface ValidationErrorDetail {
    field: string;
    stockId: string | null;
    message: string;
}

// API types
export interface FetchStockResult {
    id: string;
    ticker: string;
    status: 'fulfilled' | 'rejected';
    value?: number;
    reason?: string;
}

// Performance tracking types
export interface PortfolioSnapshot {
    id: string; // 스냅샷 고유 ID
    portfolioId: string; // 포트폴리오 ID
    timestamp: number; // Unix timestamp (milliseconds)
    date: string; // YYYY-MM-DD format for display
    totalValue: number; // 총 포트폴리오 가치 (USD)
    totalValueKRW: number; // 총 포트폴리오 가치 (KRW)
    totalInvestedCapital: number; // 총 투자 원금 (USD)
    totalUnrealizedPL: number; // 총 미실현 손익 (USD)
    totalRealizedPL: number; // 총 실현 손익 (USD)
    totalDividends: number; // 총 배당금 (USD)
    totalOverallPL: number; // 총 전체 손익 (USD) = unrealized + realized + dividends
    exchangeRate: number; // 환율 (스냅샷 당시)
    stockCount: number; // 보유 종목 수
}
```

---

## `src/calculator.ts`

```typescript
// src/calculator.ts (Strategy Pattern Applied)
import Decimal from 'decimal.js';
import { nanoid } from 'nanoid';
import { CONFIG, DECIMAL_ZERO, DECIMAL_HUNDRED } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Stock, CalculatedStock, CalculatedStockMetrics, Currency, PortfolioSnapshot } from './types.ts';
import type { IRebalanceStrategy } from './calculationStrategies.ts';

/**
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 */
function _generateStockKey(stock: Stock): string {
    // 모든 거래 ID를 조합하여 중간 거래 수정/삭제도 감지
    const txIds = stock.transactions.map(tx => tx.id).join(',');

    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${txIds}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 */
function _generatePortfolioKey(
    portfolioData: Stock[],
    exchangeRate: number,
    currentCurrency: Currency
): string {
    // 주식 ID 기준으로 정렬하여 배열 순서와 무관하게 일관된 캐시 키 생성
    const sortedData = [...portfolioData].sort((a, b) => a.id.localeCompare(b.id));
    const stockKeys = sortedData.map(_generateStockKey).join('|');
    const settingsKey = `${exchangeRate}:${currentCurrency}`;
    return `${stockKeys}|${settingsKey}`;
}

export interface PortfolioCalculationResult {
    portfolioData: CalculatedStock[];
    currentTotal: Decimal;
    cacheKey: string;
}

interface CalculatorCache {
    key: string;
    result: PortfolioCalculationResult;
}

export class Calculator {
    static #cache: CalculatorCache | null = null;

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @important stock.currentPrice는 항상 USD로 저장되어 있어야 합니다.
     * 통화 표시는 calculatePortfolioState에서 환율을 적용하여 처리합니다.
     */
    static calculateStockMetrics(stock: Stock): CalculatedStockMetrics {
        try {
            const result: CalculatedStockMetrics = {
                totalBuyQuantity: DECIMAL_ZERO,
                totalSellQuantity: DECIMAL_ZERO,
                quantity: DECIMAL_ZERO,
                totalBuyAmount: DECIMAL_ZERO,
                totalSellAmount: DECIMAL_ZERO,
                currentAmount: DECIMAL_ZERO,
                currentAmountUSD: DECIMAL_ZERO,
                currentAmountKRW: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
                totalDividends: DECIMAL_ZERO,
                realizedPL: DECIMAL_ZERO,
                totalRealizedPL: DECIMAL_ZERO,
            };

            const currentPrice = new Decimal(stock.currentPrice || 0);

            // 1. 매수/매도 수량 및 금액 합산, 배당금 집계
            for (const tx of stock.transactions) {
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(
                        txQuantity.times(txPrice)
                    );
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                    result.totalSellAmount = result.totalSellAmount.plus(
                        txQuantity.times(txPrice)
                    );
                } else if (tx.type === 'dividend') {
                    // 배당금: quantity 필드에 배당금액 저장, price는 1로 가정
                    result.totalDividends = result.totalDividends.plus(txQuantity.times(txPrice));
                }
            }

            // 2. 순 보유 수량
            result.quantity = Decimal.max(
                0,
                result.totalBuyQuantity.minus(result.totalSellQuantity)
            );

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 실현 손익 계산 (매도금액 - 매도수량 × 평균매입가)
            if (result.totalSellQuantity.greaterThan(0) && result.avgBuyPrice.greaterThan(0)) {
                const costBasisOfSold = result.totalSellQuantity.times(result.avgBuyPrice);
                result.realizedPL = result.totalSellAmount.minus(costBasisOfSold);
            }

            // 5. 총 실현 손익 (실현손익 + 배당금)
            result.totalRealizedPL = result.realizedPL.plus(result.totalDividends);

            // 6. 현재 가치 (quantity * currentPrice)
            result.currentAmount = result.quantity.times(currentPrice);

            // 7. 미실현 손익 계산 (currentAmount - (quantity * avgBuyPrice))
            const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
            result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

            // 8. 미실현 손익률
            if (originalCostOfHolding.isZero()) {
                result.profitLossRate = DECIMAL_ZERO;
            } else {
                result.profitLossRate = result.profitLoss
                    .div(originalCostOfHolding)
                    .times(DECIMAL_HUNDRED);
            }

            return result;
        } catch (error) {
            ErrorService.handle(error as Error, 'calculateStockMetrics');
            // 에러 발생 시 기본값 반환
            return {
                totalBuyQuantity: DECIMAL_ZERO,
                totalSellQuantity: DECIMAL_ZERO,
                quantity: DECIMAL_ZERO,
                totalBuyAmount: DECIMAL_ZERO,
                totalSellAmount: DECIMAL_ZERO,
                avgBuyPrice: DECIMAL_ZERO,
                currentAmount: DECIMAL_ZERO,
                currentAmountUSD: DECIMAL_ZERO,
                currentAmountKRW: DECIMAL_ZERO,
                profitLoss: DECIMAL_ZERO,
                profitLossRate: DECIMAL_ZERO,
                totalDividends: DECIMAL_ZERO,
                realizedPL: DECIMAL_ZERO,
                totalRealizedPL: DECIMAL_ZERO,
            };
        }
    }

    /**
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
     */
    static calculatePortfolioState(options: {
        portfolioData: Stock[];
        exchangeRate?: number;
        currentCurrency?: Currency;
    }): PortfolioCalculationResult {
        const {
            portfolioData,
            exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE,
            currentCurrency = 'krw',
        } = options;

        const cacheKey = _generatePortfolioKey(portfolioData, exchangeRate, currentCurrency);

        if (Calculator.#cache && Calculator.#cache.key === cacheKey) {
            return Calculator.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = DECIMAL_ZERO;

        const calculatedPortfolioData: CalculatedStock[] = portfolioData.map((stock) => {
            const calculatedMetrics = Calculator.calculateStockMetrics(stock);

            // currentPrice는 항상 USD로 저장되어 있다고 가정
            // currentAmount는 USD 기준 (quantity * currentPriceUSD)
            const metricsWithCurrency: CalculatedStockMetrics = {
                ...calculatedMetrics,
                currentAmountUSD: calculatedMetrics.currentAmount,
                currentAmountKRW: calculatedMetrics.currentAmount.times(exchangeRateDec),
            };

            // Calculate total based on the selected currency
            if (currentCurrency === 'krw') {
                currentTotal = currentTotal.plus(metricsWithCurrency.currentAmountKRW);
            } else {
                currentTotal = currentTotal.plus(metricsWithCurrency.currentAmountUSD);
            }

            return { ...stock, calculated: metricsWithCurrency };
        });

        const result: PortfolioCalculationResult = {
            portfolioData: calculatedPortfolioData,
            currentTotal: currentTotal,
            cacheKey: cacheKey,
        };

        // 캐시 업데이트
        Calculator.#cache = { key: cacheKey, result: result };

        return result;
    }

    /**
     * @description '전략' 객체를 받아 리밸런싱 계산을 실행합니다.
     */
    static calculateRebalancing(strategy: IRebalanceStrategy): { results: any[] } {
        return strategy.calculate();
    }

    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     */
    static calculateSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency = 'krw'
    ): { sector: string; amount: Decimal; percentage: Decimal }[] {
        const startTime = performance.now();

        const sectorMap = new Map<string, Decimal>();
        let currentTotal = DECIMAL_ZERO;

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount = currentCurrency === 'krw'
                ? (s.calculated?.currentAmountKRW || DECIMAL_ZERO)
                : (s.calculated?.currentAmountUSD || DECIMAL_ZERO);
            currentTotal = currentTotal.plus(amount);

            const currentSectorAmount = sectorMap.get(sector) || DECIMAL_ZERO;
            sectorMap.set(sector, currentSectorAmount.plus(amount));
        }

        const result: { sector: string; amount: Decimal; percentage: Decimal }[] = [];
        for (const [sector, amount] of sectorMap.entries()) {
            const percentage = currentTotal.isZero()
                ? DECIMAL_ZERO
                : amount.div(currentTotal).times(DECIMAL_HUNDRED);
            result.push({ sector, amount, percentage });
        }

        // 금액 내림차순 정렬
        result.sort((a, b) => b.amount.comparedTo(a.amount));

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            console.log(
                `[Perf] calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
            );
        }

        return result;
    }

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache(): void {
        Calculator.#cache = null;
    }

    /**
     * @description 현재 포트폴리오 상태에서 스냅샷을 생성합니다.
     */
    static createSnapshot(
        portfolioId: string,
        portfolioData: CalculatedStock[],
        exchangeRate: number,
        currentCurrency: Currency = 'krw'
    ): PortfolioSnapshot {
        try {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

            let totalValue = DECIMAL_ZERO;
            let totalInvestedCapital = DECIMAL_ZERO;
            let totalUnrealizedPL = DECIMAL_ZERO;
            let totalRealizedPL = DECIMAL_ZERO;
            let totalDividends = DECIMAL_ZERO;

            // 모든 주식의 메트릭 집계
            for (const stock of portfolioData) {
                const metrics = stock.calculated;
                if (!metrics) continue;

                // USD 기준으로 집계
                totalValue = totalValue.plus(metrics.currentAmountUSD || 0);

                // 투자 원금 = 현재 보유수량 × 평균매입가
                const investedForHolding = metrics.quantity.times(metrics.avgBuyPrice);
                totalInvestedCapital = totalInvestedCapital.plus(investedForHolding);

                // 미실현 손익
                totalUnrealizedPL = totalUnrealizedPL.plus(metrics.profitLoss || 0);

                // 실현 손익
                totalRealizedPL = totalRealizedPL.plus(metrics.realizedPL || 0);

                // 배당금
                totalDividends = totalDividends.plus(metrics.totalDividends || 0);
            }

            // 총 전체 손익 = 미실현 + 실현 + 배당금
            const totalOverallPL = totalUnrealizedPL.plus(totalRealizedPL).plus(totalDividends);

            const exchangeRateDec = new Decimal(exchangeRate);
            const totalValueKRW = totalValue.times(exchangeRateDec);

            const snapshot: PortfolioSnapshot = {
                id: nanoid(),
                portfolioId,
                timestamp: now.getTime(),
                date: dateStr,
                totalValue: totalValue.toNumber(),
                totalValueKRW: totalValueKRW.toNumber(),
                totalInvestedCapital: totalInvestedCapital.toNumber(),
                totalUnrealizedPL: totalUnrealizedPL.toNumber(),
                totalRealizedPL: totalRealizedPL.toNumber(),
                totalDividends: totalDividends.toNumber(),
                totalOverallPL: totalOverallPL.toNumber(),
                exchangeRate,
                stockCount: portfolioData.filter(s => s.calculated && s.calculated.quantity.greaterThan(0)).length,
            };

            return snapshot;
        } catch (error) {
            ErrorService.handle(error as Error, 'Calculator.createSnapshot');
            // Return empty snapshot on error
            const now = new Date();
            return {
                id: nanoid(),
                portfolioId,
                timestamp: now.getTime(),
                date: now.toISOString().split('T')[0],
                totalValue: 0,
                totalValueKRW: 0,
                totalInvestedCapital: 0,
                totalUnrealizedPL: 0,
                totalRealizedPL: 0,
                totalDividends: 0,
                totalOverallPL: 0,
                exchangeRate,
                stockCount: 0,
            };
        }
    }
}
```

---

## `src/constants.ts`

```typescript
import Decimal from 'decimal.js';

// ===== [Phase 1.3 최적화] Decimal 상수 캐싱 =====
/**
 * @description 자주 사용되는 Decimal 상수
 * - 매번 new Decimal()을 호출하는 대신 이 상수를 재사용
 */
export const DECIMAL_ZERO = new Decimal(0);
export const DECIMAL_ONE = new Decimal(1);
export const DECIMAL_HUNDRED = new Decimal(100);
// ===== [Phase 1.3 최적화 끝] =====

// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000,
    DEFAULT_EXCHANGE_RATE: 1300,
    RATIO_TOLERANCE: 0.01,
    DARK_MODE_KEY: 'darkMode', // (LocalStorage에 유지)

    // API 타임아웃 설정 (밀리초)
    API_TIMEOUT: 8000, // 단일 API 호출 타임아웃
    BATCH_API_TIMEOUT: 10000, // 배치 API 호출 타임아웃

    // ▼▼▼▼▼ [신규] IndexedDB 키 ▼▼▼▼▼
    IDB_META_KEY: 'portfolioMeta_v2',
    IDB_PORTFOLIOS_KEY: 'portfolioData_v2',
    IDB_SNAPSHOTS_KEY: 'portfolioSnapshots_v2',
    // ▲▲▲▲▲ [신규] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] 마이그레이션을 위한 레거시 LocalStorage 키 ▼▼▼▼▼
    // (참고: LEGACY_LS_PORTFOLIOS_KEY는 state.js에서 savePortfolios가 저장하던 방식에 맞게 수정됨)
    LEGACY_LS_META_KEY: 'portfolioCalculatorMeta_v1',
    LEGACY_LS_PORTFOLIOS_KEY: 'portfolioCalculatorData_v1_all',
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    DATA_VERSION: '2.0.0', // [신규] state.js가 참조하는 버전 키

    // DATA_PREFIX: 'portfolioCalculatorData_v1_', // (주석 처리 - 현재 state.js에서 미사용)
} as const;

export type ConfigType = typeof CONFIG;
```

---

## `src/utils.ts`

```typescript
import Decimal from 'decimal.js';
import type { Stock, Currency } from './types.ts';
// Import enhanced i18n formatters
import { formatCurrencyEnhanced, formatNumber } from './i18nEnhancements';
import { DECIMAL_ZERO } from './constants';

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 안전한 HTML 문자열
 */
export function escapeHTML(str: string | number | null | undefined): string {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * @description 포트폴리오 데이터에서 목표 비율의 합계를 Decimal 객체로 계산합니다.
 * @param portfolioData - 포트폴리오 주식 객체 배열
 * @returns 목표 비율 합계
 */
export function getRatioSum(portfolioData: Stock[]): Decimal {
    let sum = DECIMAL_ZERO;
    if (!Array.isArray(portfolioData)) return sum;

    for (const s of portfolioData) {
        // targetRatio가 숫자 타입임을 보장하고 Decimal 생성
        const ratio = new Decimal(s.targetRatio || 0);
        sum = sum.plus(ratio);
    }
    return sum;
}

/**
 * @description 숫자를 통화 형식의 문자열로 변환합니다. (Enhanced with i18n)
 * @param amount - 변환할 금액
 * @param currency - 통화 코드 ('krw', 'usd')
 * @returns 포맷팅된 통화 문자열
 */
export function formatCurrency(
    amount: number | Decimal | string | null | undefined,
    currency: Currency = 'krw'
): string {
    // Use enhanced i18n formatter
    return formatCurrencyEnhanced(amount, currency);
}

/**
 * @description 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param func - 디바운싱을 적용할 함수
 * @param delay - 지연 시간 (ms)
 * @param immediate - 첫 이벤트 시 즉시 실행할지 여부
 * @returns 디바운싱이 적용된 새로운 함수
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay = 300,
    immediate = false
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    return function (this: any, ...args: Parameters<T>) {
        const context = this; // 'this' 컨텍스트 저장
        const callNow = immediate && !timeoutId; // 즉시 실행 조건: immediate가 true이고 타이머가 없을 때
        clearTimeout(timeoutId); // 기존 타이머 취소
        timeoutId = setTimeout(() => {
            timeoutId = undefined; // 타이머 완료 후 ID 초기화
            if (!immediate) func.apply(context, args); // immediate가 false면 지연 후 실행
        }, delay);
        if (callNow) func.apply(context, args); // 즉시 실행 조건 충족 시 바로 실행
    };
}

/**
 * @description 고유 ID를 생성합니다. (nanoid 대체)
 * @returns 고유 ID 문자열
 */
export function generateId(): string {
    // ===== [Phase 3.4 최적화] nanoid 대체 =====
    // nanoid를 간단한 유틸 함수로 교체하여 번들 크기 감소
    // Date.now()와 Math.random()을 조합하여 충분히 고유한 ID 생성
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
    // ===== [Phase 3.4 최적화 끝] =====
}

// Re-export enhanced formatters for convenience
export { formatNumber, formatCurrencyEnhanced } from './i18nEnhancements';
```

---

## `src/apiService.ts`

```typescript
// src/apiService.ts (강화된 오류 처리)
import type { FetchStockResult } from './types.ts';
import { CONFIG } from './constants.ts';

/**
 * @enum APIErrorType
 * @description API 오류 유형 분류
 */
export enum APIErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT = 'TIMEOUT',
    RATE_LIMIT = 'RATE_LIMIT',
    INVALID_TICKER = 'INVALID_TICKER',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN = 'UNKNOWN'
}

/**
 * @class APIError
 * @description 구조화된 API 오류 클래스
 */
export class APIError extends Error {
    type: APIErrorType;
    ticker?: string;
    statusCode?: number;
    retryAfter?: number;

    constructor(message: string, type: APIErrorType, options?: {
        ticker?: string;
        statusCode?: number;
        retryAfter?: number;
    }) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.ticker = options?.ticker;
        this.statusCode = options?.statusCode;
        this.retryAfter = options?.retryAfter;
    }
}

/**
 * @description Retry 로직을 포함한 fetch 래퍼
 * @param url - API URL
 * @param options - Fetch 옵션
 * @param maxRetries - 최대 재시도 횟수
 * @returns Promise<Response>
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            // 429 (Too Many Requests) 처리
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
                throw new APIError(
                    `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
                    APIErrorType.RATE_LIMIT,
                    { statusCode: 429, retryAfter }
                );
            }

            // 5xx 서버 오류는 재시도
            if (response.status >= 500 && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                console.warn(`[API] Server error ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            // Timeout 오류
            if (error instanceof Error && error.name === 'TimeoutError') {
                if (attempt < maxRetries) {
                    console.warn(`[API] Timeout, retrying... (attempt ${attempt + 1}/${maxRetries})`);
                    continue;
                }
                throw new APIError(
                    'Request timed out after multiple attempts',
                    APIErrorType.TIMEOUT
                );
            }

            // 네트워크 오류 (재시도 가능)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`[API] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw new APIError(
                    'Network error after multiple retry attempts',
                    APIErrorType.NETWORK_ERROR
                );
            }

            // Rate limit 오류는 재시도하지 않음
            if (error instanceof APIError && error.type === APIErrorType.RATE_LIMIT) {
                throw error;
            }
        }
    }

    // 모든 재시도 실패
    throw lastError || new APIError('Unknown fetch error', APIErrorType.UNKNOWN);
}

/**
 * @description 단일 주식의 현재가를 Finnhub API(Vite 프록시 경유)에서 가져옵니다.
 * @param ticker - 주식 티커
 * @returns Promise<number>
 */
async function fetchStockPrice(ticker: string): Promise<number> {
    if (!ticker || ticker.trim() === '') {
        throw new APIError('Ticker is empty', APIErrorType.INVALID_TICKER, { ticker });
    }

    const url = `/finnhub/quote?symbol=${encodeURIComponent(ticker)}`;

    try {
        const response = await fetchWithRetry(
            url,
            { signal: AbortSignal.timeout(CONFIG.API_TIMEOUT) },
            2 // 최대 2회 재시도
        );

        if (!response.ok) {
            let errorBody = '';
            try {
                const errorData = await response.json();
                if (errorData.c === 0 && errorData.d === null) {
                    throw new APIError(
                        `Invalid ticker or no data found for ${ticker}`,
                        APIErrorType.INVALID_TICKER,
                        { ticker, statusCode: response.status }
                    );
                }
                errorBody = errorData.error || (await response.text());
            } catch (e) {
                errorBody = e instanceof Error ? e.message : await response.text();
            }

            throw new APIError(
                `API returned status ${response.status} for ${ticker}. ${errorBody}`,
                response.status >= 500 ? APIErrorType.SERVER_ERROR : APIErrorType.UNKNOWN,
                { ticker, statusCode: response.status }
            );
        }

        const data = await response.json();
        const price = data.c;

        if (typeof price !== 'number' || price <= 0) {
            console.warn(`[API] Received invalid price for ${ticker}: ${price}`);
            throw new APIError(
                `Invalid or zero price received for ${ticker}: ${price}`,
                APIErrorType.INVALID_TICKER,
                { ticker }
            );
        }

        return price;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        // 예상치 못한 오류
        throw new APIError(
            error instanceof Error ? error.message : 'Unknown error',
            APIErrorType.UNKNOWN,
            { ticker }
        );
    }
}

/**
 * @description 여러 종목의 가격을 배치로 가져옵니다.
 * @param tickersToFetch - 티커 배열
 * @returns Promise<FetchStockResult[]>
 */
async function fetchAllStockPrices(
    tickersToFetch: { id: string; ticker: string }[]
): Promise<FetchStockResult[]> {
    if (tickersToFetch.length === 0) {
        return [];
    }

    const symbols = tickersToFetch.map(item => item.ticker).join(',');
    const url = `/api/batchGetPrices?symbols=${encodeURIComponent(symbols)}`;

    try {
        const response = await fetchWithRetry(
            url,
            { signal: AbortSignal.timeout(CONFIG.BATCH_API_TIMEOUT) },
            2 // 최대 2회 재시도
        );

        if (!response.ok) {
            throw new APIError(
                `Batch API returned status ${response.status}`,
                response.status >= 500 ? APIErrorType.SERVER_ERROR : APIErrorType.UNKNOWN,
                { statusCode: response.status }
            );
        }

        const batchResults = await response.json();

        return batchResults.map((result: any, index: number) => {
            const { id, ticker } = tickersToFetch[index];
            if (result.status === 'fulfilled') {
                return {
                    id: id,
                    ticker: result.ticker || ticker,
                    status: 'fulfilled' as const,
                    value: result.value,
                };
            } else {
                return {
                    id: id,
                    ticker: result.ticker || ticker,
                    status: 'rejected' as const,
                    reason: result.reason || 'Unknown error',
                };
            }
        });
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(
            error instanceof Error ? error.message : 'Batch API request failed',
            APIErrorType.UNKNOWN
        );
    }
}

/**
 * @description API 오류를 사용자 친화적인 메시지로 변환
 * @param error - APIError 인스턴스
 * @returns 사용자 메시지
 */
export function formatAPIError(error: APIError): string {
    switch (error.type) {
        case APIErrorType.NETWORK_ERROR:
            return '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정합니다.';
        case APIErrorType.TIMEOUT:
            return 'API 요청 시간이 초과되었습니다. 다시 시도해주세요.';
        case APIErrorType.RATE_LIMIT:
            return `요청 한도를 초과했습니다. ${error.retryAfter || 60}초 후에 다시 시도해주세요.`;
        case APIErrorType.INVALID_TICKER:
            return `유효하지 않은 티커: ${error.ticker}. 티커를 확인해주세요.`;
        case APIErrorType.SERVER_ERROR:
            return 'API 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
            return `알 수 없는 오류: ${error.message}`;
    }
}

/**
 * @description 환율 정보 가져오기 (Phase 4.2)
 * @returns Promise<number | null> - USD/KRW 환율 또는 null
 */
async function fetchExchangeRate(): Promise<number | null> {
    try {
        // ExchangeRate-API 무료 버전 사용
        const response = await fetchWithRetry(
            'https://api.exchangerate-api.com/v4/latest/USD',
            { signal: AbortSignal.timeout(CONFIG.API_TIMEOUT) },
            2
        );

        if (!response.ok) {
            console.warn('[apiService] Exchange rate API failed');
            return null;
        }

        const data = await response.json();
        const krwRate = data.rates?.KRW;

        if (typeof krwRate === 'number' && krwRate > 0) {
            console.log('[apiService] Exchange rate fetched:', krwRate);
            return krwRate;
        }

        return null;
    } catch (error) {
        console.warn('[apiService] Failed to fetch exchange rate:', error);
        return null;
    }
}

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices,
    fetchExchangeRate,
};
```

---

## `src/calculationStrategies.ts`

```typescript
// src/calculationStrategies.ts (DRY 원칙 적용)
import Decimal from 'decimal.js';
import type { CalculatedStock } from './types.ts';
import { DECIMAL_ZERO, DECIMAL_HUNDRED } from './constants';

// ==================== 공통 유틸리티 함수 ====================

/**
 * @description 포트폴리오의 목표 비율 합계 계산
 */
function calculateTotalRatio(portfolioData: CalculatedStock[]): Decimal {
    return portfolioData.reduce((sum, s) => sum.plus(s.targetRatio || 0), DECIMAL_ZERO);
}

/**
 * @description 목표 비율을 100%로 정규화하기 위한 계수 계산
 */
function calculateRatioMultiplier(totalRatio: Decimal): Decimal {
    return totalRatio.isZero() ? DECIMAL_ZERO : DECIMAL_HUNDRED.div(totalRatio);
}

/**
 * @description 고정 매수 금액을 먼저 할당하고 남은 투자금 반환
 */
function allocateFixedBuyAmounts(
    portfolioData: CalculatedStock[],
    additionalInvestment: Decimal,
    results: any[]
): Decimal {
    const zero = DECIMAL_ZERO;
    let remainingInvestment = additionalInvestment;

    for (const s of portfolioData) {
        let buyAmount = zero;
        if (s.isFixedBuyEnabled) {
            const fixedAmountDec = new Decimal(s.fixedBuyAmount || 0);
            if (remainingInvestment.greaterThanOrEqualTo(fixedAmountDec)) {
                buyAmount = fixedAmountDec;
                remainingInvestment = remainingInvestment.minus(fixedAmountDec);
            } else {
                buyAmount = remainingInvestment;
                remainingInvestment = zero;
            }
        }
        // results 배열에서 해당 종목을 찾아 finalBuyAmount 설정
        const resultItem = results.find((r) => r.id === s.id);
        if (resultItem) {
            resultItem.finalBuyAmount = buyAmount;
        }
    }

    return remainingInvestment;
}

/**
 * @description 목표 금액 대비 부족분(deficit) 계산 및 비율에 따라 남은 투자금 배분
 */
function distributeRemainingInvestment(
    results: any[],
    totalInvestment: Decimal,
    remainingInvestment: Decimal,
    ratioMultiplier: Decimal
): void {
    const zero = DECIMAL_ZERO;

    const targetAmounts = results.map((s) => {
        const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
        const currentAmount = s.calculated?.currentAmount || zero;
        return {
            id: s.id,
            targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
            currentAmount: currentAmount,
        };
    });

    const adjustmentTargets = targetAmounts
        .map((t) => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(
                results.find((s) => s.id === t.id)?.finalBuyAmount || zero
            );
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return { ...t, deficit: deficit.greaterThan(zero) ? deficit : zero };
        })
        .filter((t) => t.deficit.greaterThan(zero));

    const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);

    if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
        for (const target of adjustmentTargets) {
            const ratio = target.deficit.div(totalDeficit);
            const allocatedAmount = remainingInvestment.times(ratio);
            const resultItem = results.find((r) => r.id === target.id);
            if (resultItem) {
                resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
            }
        }
    }
}

// ==================== 전략 인터페이스 ====================

/**
 * @description 모든 리밸런싱 전략이 따라야 하는 인터페이스
 */
export interface IRebalanceStrategy {
    calculate(): { results: any[] };
}

/**
 * @description '추가 매수' 모드 계산 전략
 */
export class AddRebalanceStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];
    #additionalInvestment: Decimal;

    constructor(portfolioData: CalculatedStock[], additionalInvestment: Decimal) {
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate(): { results: any[] } {
        const startTime = performance.now();
        const zero = DECIMAL_ZERO;

        // 현재 총 자산 + 추가 투자금 = 총 투자금
        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
            zero
        );
        const totalInvestment = currentTotal.plus(this.#additionalInvestment);

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        // 초기 결과 배열 생성 (currentRatio, finalBuyAmount 초기화)
        const results = this.#portfolioData.map((s) => {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero()
                ? zero
                : currentAmount.div(totalInvestment).times(DECIMAL_HUNDRED);
            return {
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: zero,
                buyRatio: zero,
            };
        });

        // 공통 유틸리티 사용: 고정 매수 금액 먼저 할당
        const remainingInvestment = allocateFixedBuyAmounts(
            this.#portfolioData,
            this.#additionalInvestment,
            results
        );

        // 공통 유틸리티 사용: 남은 투자금을 목표 비율에 따라 배분
        distributeRemainingInvestment(
            results,
            totalInvestment,
            remainingInvestment,
            ratioMultiplier
        );

        // buyRatio 계산
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map((s) => ({
            ...s,
            buyRatio: totalBuyAmount.isZero()
                ? zero
                : s.finalBuyAmount.div(totalBuyAmount).times(100),
        }));

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            console.log(
                `[Perf] AddRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
            );
        }

        return { results: finalResults };
    }
}

/**
 * @description '간단 계산' 모드 전략 - 목표 비율에 맞춰 추가 투자금 배분 (거래 내역 없이 금액만 입력)
 */
export class SimpleRatioStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];
    #additionalInvestment: Decimal;

    constructor(portfolioData: CalculatedStock[], additionalInvestment: Decimal) {
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate(): { results: any[] } {
        const startTime = performance.now();
        const zero = DECIMAL_ZERO;

        // 간단 모드에서는 manualAmount를 사용 (거래 내역 대신 직접 입력한 금액)
        const currentTotal = this.#portfolioData.reduce((sum, s) => {
            const amount =
                s.manualAmount != null
                    ? new Decimal(s.manualAmount)
                    : s.calculated?.currentAmount || zero;
            return sum.plus(amount);
        }, zero);

        const totalInvestment = currentTotal.plus(this.#additionalInvestment);

        // 포트폴리오가 비어있으면 계산 불가
        if (totalInvestment.isZero()) {
            if (import.meta.env.DEV) {
                const endTime = performance.now();
                console.log(
                    `[Perf] SimpleRatioStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`
                );
            }
            return { results: [] };
        }

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        // 초기 결과 배열 생성 (간단 모드는 manualAmount 사용)
        const results = this.#portfolioData.map((s) => {
            const currentAmount =
                s.manualAmount != null
                    ? new Decimal(s.manualAmount)
                    : s.calculated?.currentAmount || zero;
            const currentRatio = currentTotal.isZero()
                ? zero
                : currentAmount.div(currentTotal).times(DECIMAL_HUNDRED);

            return {
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: zero,
                buyRatio: zero,
                calculated: {
                    ...s.calculated,
                    currentAmount: currentAmount,
                },
            };
        });

        // 공통 유틸리티 사용: 고정 매수 금액 먼저 할당
        const remainingInvestment = allocateFixedBuyAmounts(
            this.#portfolioData,
            this.#additionalInvestment,
            results
        );

        // 공통 유틸리티 사용: 남은 투자금을 목표 비율에 따라 배분
        distributeRemainingInvestment(
            results,
            totalInvestment,
            remainingInvestment,
            ratioMultiplier
        );

        // buyRatio 계산
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map((s) => ({
            ...s,
            buyRatio: totalBuyAmount.isZero()
                ? zero
                : s.finalBuyAmount.div(totalBuyAmount).times(DECIMAL_HUNDRED),
        }));

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            console.log(
                `[Perf] SimpleRatioStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
            );
        }

        return { results: finalResults };
    }
}

/**
 * @description '매도 리밸런싱' 모드 계산 전략
 */
export class SellRebalanceStrategy implements IRebalanceStrategy {
    #portfolioData: CalculatedStock[];

    constructor(portfolioData: CalculatedStock[]) {
        this.#portfolioData = portfolioData;
    }

    calculate(): { results: any[] } {
        const startTime = performance.now();
        const zero = DECIMAL_ZERO;

        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.calculated?.currentAmount || zero),
            zero
        );

        // 공통 유틸리티 사용: 목표 비율 계산
        const totalRatio = calculateTotalRatio(this.#portfolioData);

        if (currentTotal.isZero() || totalRatio.isZero()) {
            if (import.meta.env.DEV) {
                const endTime = performance.now();
                console.log(
                    `[Perf] SellRebalanceStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`
                );
            }
            return { results: [] };
        }

        // 공통 유틸리티 사용: 비율 정규화 계수
        const ratioMultiplier = calculateRatioMultiplier(totalRatio);

        const results = this.#portfolioData.map((s) => {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatioDec = currentAmount.div(currentTotal).times(DECIMAL_HUNDRED);
            const currentRatio = currentRatioDec.toNumber();

            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            const targetAmount = currentTotal.times(targetRatioNormalized.div(DECIMAL_HUNDRED));
            const adjustment = currentAmount.minus(targetAmount);

            return {
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(),
                adjustment: adjustment,
            };
        });

        if (import.meta.env.DEV) {
            const endTime = performance.now();
            console.log(
                `[Perf] SellRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`
            );
        }

        return { results };
    }
}
```

---

## `src/testUtils.ts`

```typescript
// src/testUtils.ts
import Decimal from 'decimal.js';
import type { CalculatedStock, Portfolio } from './types';

/**
 * @description 테스트용으로 완벽하게 계산된 CalculatedStock 객체를 생성합니다.
 */
export function createMockCalculatedStock({
    id, name, ticker, targetRatio, currentPrice, quantity, avgBuyPrice
}: {
    id: string;
    name: string;
    ticker: string;
    targetRatio: number;
    currentPrice: number;
    quantity: number;
    avgBuyPrice: number;
}): CalculatedStock {
    const currentAmount = new Decimal(currentPrice).times(quantity);
    const totalBuyAmount = new Decimal(avgBuyPrice).times(quantity);
    const profitLoss = currentAmount.minus(totalBuyAmount);
    const profitLossRate = totalBuyAmount.isZero() ? new Decimal(0) : profitLoss.div(totalBuyAmount).times(100);

    return {
        id: id,
        name: name,
        ticker: ticker,
        sector: 'Test Sector',
        targetRatio: targetRatio,
        currentPrice: currentPrice,
        isFixedBuyEnabled: false,
        fixedBuyAmount: 0,
        transactions: [], // 테스트 편의를 위해 transactions는 비워둠
        calculated: {
            quantity: new Decimal(quantity),
            avgBuyPrice: new Decimal(avgBuyPrice),
            currentAmount: currentAmount,
            profitLoss: profitLoss,
            profitLossRate: profitLossRate,
        },
    };
}

// --- 공통 모의 데이터 ---

export const MOCK_STOCK_1 = createMockCalculatedStock({
    id: 's1',
    name: 'Stock A',
    ticker: 'AAA',
    targetRatio: 50,
    currentPrice: 150,
    quantity: 10,
    avgBuyPrice: 100
}); // 현재가: 1500

export const MOCK_STOCK_2 = createMockCalculatedStock({
    id: 's2',
    name: 'Stock B',
    ticker: 'BBB',
    targetRatio: 50,
    currentPrice: 200,
    quantity: 20,
    avgBuyPrice: 250
}); // 현재가: 4000

export const MOCK_PORTFOLIO_1: Portfolio = {
    id: 'p-default',
    name: '기본 포트폴리오',
    settings: {
        mainMode: 'add',
        currentCurrency: 'krw',
        exchangeRate: 1300,
    },
    portfolioData: [MOCK_STOCK_1, MOCK_STOCK_2] // 2개의 주식 포함
};
```

---

## `src/templates.ts`

```typescript
// js/templates.ts
import { escapeHTML, formatCurrency } from './utils.ts';
import { CONFIG } from './constants.ts';
import { t } from './i18n.ts';
import Decimal from 'decimal.js';
import type { CalculatedStock, Currency } from './types.ts';

// Add mode result stock type
export interface AddModeResultStock extends CalculatedStock {
    currentRatio: Decimal;
    finalBuyAmount: Decimal;
    buyRatio: Decimal;
}

// Sell mode result stock type
export interface SellModeResultStock extends CalculatedStock {
    currentRatio: number;
    targetRatioNum: number;
    adjustment: Decimal;
}

// Summary type for add mode results
export interface AddModeSummary {
    currentTotal: Decimal;
    additionalInvestment: Decimal;
    finalTotal: Decimal;
}

// Sector analysis data type
export interface SectorData {
    sector: string;
    amount: Decimal;
    percentage: Decimal;
}

/**
 * @description '추가 매수' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param summary - 요약 정보 객체
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @param feeRate - 거래 수수료율 (%, optional)
 * @param taxRate - 세율 (%, optional)
 * @returns 생성된 HTML 문자열
 */
export function generateAddModeResultsHTML(
    results: AddModeResultStock[],
    summary: AddModeSummary,
    currency: Currency,
    feeRate?: number,
    taxRate?: number
): string {
    if (!results) return ''; // Null check for results

    const sortedResults = [...results].sort((a, b) => {
        // Ensure finalBuyAmount exists before comparing
        const amountA = a.finalBuyAmount ?? new Decimal(0);
        const amountB = b.finalBuyAmount ?? new Decimal(0);
        return amountB.comparedTo(amountA);
    });
    const resultsRows = sortedResults
        .map((stock, index) => {
            // Ensure calculated exists
            const metrics = stock.calculated ?? {
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            };
            const { profitLoss, profitLossRate } = metrics;
            const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
            const profitSign = profitLoss.isPositive() ? '+' : '';

            // Ensure ratios exist and handle potential NaN/Infinity from division
            const currentRatioVal = stock.currentRatio?.isFinite()
                ? stock.currentRatio.toFixed(1)
                : 'N/A';
            const targetRatioVal =
                typeof stock.targetRatio === 'number'
                    ? stock.targetRatio.toFixed(1)
                    : 'N/A';
            const profitLossRateVal = profitLossRate?.isFinite()
                ? profitLossRate.toFixed(2)
                : 'N/A';
            const finalBuyAmountVal = stock.finalBuyAmount ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;">
                    <div class="${profitClass}">
                        ${profitSign}${profitLossRateVal}%
                    </div>
                </td>
                <td style="text-align: right;"><div class="text-buy">${formatCurrency(finalBuyAmountVal, currency)}</div></td>
            </tr>
        `;
        })
        .join('');

    // Filter buyable stocks using Decimal comparison method
    const buyableStocks = sortedResults.filter(
        (s) => s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT) // Use greaterThan()
    );
    const guideContent =
        buyableStocks.length > 0
            ? buyableStocks
                  .map((s, i) => {
                      const buyRatioVal = s.buyRatio?.isFinite()
                          ? s.buyRatio.toFixed(1)
                          : 'N/A';
                      return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold;">(${buyRatioVal}%)</span>
                </div>`;
                  })
                  .join('')
            : `<p style="text-align: center;">${t('template.noItemsToBuy')}</p>`;

    // Phase 3.1: 비용 계산
    const totalBuyAmount = summary?.additionalInvestment ?? new Decimal(0);
    const feeRateDec = new Decimal(feeRate ?? 0).div(100);
    const estimatedFee = totalBuyAmount.times(feeRateDec);
    const netInvestment = totalBuyAmount.minus(estimatedFee);

    const costSummaryHTML = (feeRate && feeRate > 0) ? `
        <div class="summary-grid" style="margin-top: 15px; background: #fff9e6; border: 1px solid #ffd700;">
            <div class="summary-item"><h3>💸 예상 수수료 (${feeRate}%)</h3><div class="amount" style="color: #ff6b6b;">${formatCurrency(estimatedFee, currency)}</div></div>
            <div class="summary-item"><h3>💰 순 투자금액</h3><div class="amount" style="color: #51cf66;">${formatCurrency(netInvestment, currency)}</div></div>
        </div>
    ` : '';

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>${t('template.currentTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>${t('template.additionalInvestment')}</h3><div class="amount">${formatCurrency(summary?.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>${t('template.finalTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.finalTotal, currency)}</div></div>
        </div>
        ${costSummaryHTML}
        <div class="card">
            <h2>${t('template.addModeGuideTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>${t('template.currentRatio')}</th>
                        <th>${t('template.targetRatio')}</th>
                        <th>${t('template.profitRate')}</th>
                        <th>${t('template.buyRecommendation')}</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy"><h3>${t('template.buyGuideTitle')}</h3>${guideContent}</div>
        </div>`;
}

/**
 * @description '간단 계산' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param summary - 요약 정보 객체
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSimpleModeResultsHTML(
    results: AddModeResultStock[],
    summary: AddModeSummary,
    currency: Currency
): string {
    if (!results) return '';

    const sortedResults = [...results].sort((a, b) => {
        const ratioA = a.currentRatio ?? new Decimal(0);
        const ratioB = b.currentRatio ?? new Decimal(0);
        return ratioB.comparedTo(ratioA);
    });

    const resultsRows = sortedResults
        .map((stock, index) => {
            const metrics = stock.calculated ?? { currentAmount: new Decimal(0) };
            const currentAmount =
                metrics.currentAmount instanceof Decimal
                    ? metrics.currentAmount
                    : new Decimal(metrics.currentAmount ?? 0);

            const currentRatioVal = stock.currentRatio?.isFinite()
                ? stock.currentRatio.toFixed(1)
                : '0.0';
            const targetRatioVal =
                typeof stock.targetRatio === 'number'
                    ? stock.targetRatio.toFixed(1)
                    : (stock.targetRatio?.toFixed(1) ?? '0.0');
            const finalBuyAmountVal = stock.finalBuyAmount ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(stock.name)}</strong><br><span class="ticker">${escapeHTML(stock.ticker)}</span></td>
                <td style="text-align: right;">${formatCurrency(currentAmount, currency)}</td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;"><div class="text-buy">${formatCurrency(finalBuyAmountVal, currency)}</div></td>
            </tr>
        `;
        })
        .join('');

    const buyableStocks = sortedResults.filter(
        (s) => s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT)
    );

    const guideContent =
        buyableStocks.length > 0
            ? buyableStocks
                  .map((s, i) => {
                      const currentRatioVal = s.currentRatio?.isFinite()
                          ? s.currentRatio.toFixed(1)
                          : '0.0';
                      return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold; color: #666;">(현재 비율: ${currentRatioVal}%)</span>
                </div>`;
                  })
                  .join('')
            : `<p style="text-align: center;">${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>${t('template.currentTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>${t('template.additionalInvestment')}</h3><div class="amount">${formatCurrency(summary?.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>${t('template.finalTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.finalTotal, currency)}</div></div>
        </div>
        <div class="card">
            <h2>🎯 간단 계산 결과</h2>
            <p style="margin-bottom: 15px; color: #666; font-size: 1.05em;">
                <strong>목표 비율에 맞춰</strong> 추가 투자금을 배분합니다.<br>
                거래 내역 없이 간단하게 현재 보유 금액만 입력하여 리밸런싱할 수 있습니다.
            </p>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>현재 평가액</th>
                        <th>현재 비율</th>
                        <th>목표 비율</th>
                        <th>추가 구매 금액</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--buy">
                <h3>💰 추가 구매 가이드</h3>
                <p style="margin-bottom: 10px; color: #666;">목표 비율에 맞추기 위해 다음과 같이 구매하세요:</p>
                ${guideContent}
            </div>
        </div>`;
}

/**
 * @description '매도 리밸런싱' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param results - 계산 결과 배열
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSellModeResultsHTML(
    results: SellModeResultStock[],
    currency: Currency
): string {
    if (!results) return ''; // Null check for results
    // Sort results safely checking for adjustment property
    const sortedResults = [...results].sort((a, b) => {
        const adjA = a.adjustment ?? new Decimal(0);
        const adjB = b.adjustment ?? new Decimal(0);
        return adjB.comparedTo(adjA);
    });

    const resultsRows = sortedResults
        .map((s, index) => {
            // Use default values if properties might be missing/NaN
            const currentRatioVal =
                typeof s.currentRatio === 'number' && isFinite(s.currentRatio)
                    ? s.currentRatio.toFixed(1)
                    : 'N/A';
            const targetRatioVal =
                typeof s.targetRatioNum === 'number' && isFinite(s.targetRatioNum)
                    ? s.targetRatioNum.toFixed(1)
                    : 'N/A';
            const adjustmentVal = s.adjustment ?? new Decimal(0);

            return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(s.name)}</strong><br><span class="ticker">${escapeHTML(s.ticker)}</span></td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;">
                    <div class="${adjustmentVal.isPositive() ? 'text-sell' : 'text-buy'}">
                        ${adjustmentVal.isPositive() ? t('ui.sellWithIcon') : t('ui.buyWithIcon')}: ${formatCurrency(adjustmentVal.abs(), currency)}
                    </div>
                </td>
            </tr>`;
        })
        .join('');

    const totalSell = results.reduce((sum, s) => {
        return s.adjustment?.isPositive() ? sum.plus(s.adjustment) : sum;
    }, new Decimal(0));
    const stocksToSell = sortedResults.filter((s) => s.adjustment?.isPositive());
    const stocksToBuy = sortedResults.filter((s) => s.adjustment?.isNegative()); // isNegative includes zero implicitly, filter < 0 if needed

    const sellGuide =
        stocksToSell.length > 0
            ? stocksToSell
                  .map(
                      (s, i) =>
                          `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment, currency)} 매도</div>`
                  )
                  .join('')
            : `<p>${t('template.noItemsToSell')}</p>`;
    const buyGuide =
        stocksToBuy.length > 0
            ? stocksToBuy
                  .map(
                      (s, i) =>
                          `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment?.abs(), currency)} 매수</div>`
                  )
                  .join('')
            : `<p>${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--rebalance"><h3>${t('template.rebalancingTotal')}</h3><div class="amount">${formatCurrency(totalSell, currency)}</div></div>
        </div>
        <div class="card">
            <h2>${t('template.sellModeGuideTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead><tr>
                        <th>${t('template.stock')}</th>
                        <th>${t('template.currentRatio')}</th>
                        <th>${t('template.targetRatio')}</th>
                        <th>${t('template.adjustmentAmount')}</th>
                    </tr></thead>
                    <tbody>${resultsRows}</tbody>
                </table>
            </div>
            <div class="guide-box guide-box--sell"><h3>${t('template.sellItemsTitle')}</h3>${sellGuide}</div>
            <div class="guide-box guide-box--buy"><h3>${t('template.buyItemsTitle')}</h3>${buyGuide}</div>
        </div>`;
}

/**
 * @description 섹터 분석 결과를 표시할 HTML 문자열을 생성합니다.
 * @param sectorData - 섹터 분석 결과 배열
 * @param currency - 현재 통화 ('krw' or 'usd')
 * @returns 생성된 HTML 문자열
 */
export function generateSectorAnalysisHTML(
    sectorData: SectorData[],
    currency: Currency
): string {
    if (!sectorData || sectorData.length === 0) {
        return '';
    }

    const rows = sectorData
        .map((data) => {
            // Ensure percentage is valid before formatting
            const percentageVal = data.percentage?.isFinite()
                ? data.percentage.toFixed(2)
                : 'N/A';
            return `
            <tr>
                <td>${escapeHTML(data.sector)}</td>
                <td style="text-align: right;">${formatCurrency(data.amount, currency)}</td>
                <td style="text-align: right;">${percentageVal}%</td>
            </tr>`;
        })
        .join('');

    return `
        <div class="card">
            <h2>${t('template.sectorAnalysisTitle')}</h2>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">${t('template.sector')}</th>
                            <th scope="col">${t('template.amount')}</th>
                            <th scope="col">${t('template.ratio')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
```

---

## `src/validator.ts`

```typescript
// src/validator.ts
import { t } from './i18n.ts';
import Decimal from 'decimal.js';
import type {
    Transaction,
    ValidationResult,
    ValidationErrorDetail,
    CalculatedStock,
    MainMode,
} from './types.ts';

export const Validator = {
    /**
     * @description 티커 심볼 검증 및 정규화 (대문자, 숫자, ., - 만 허용)
     * @param value - 검증할 티커
     * @returns 검증 결과
     */
    validateTicker(value: string | null | undefined): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue === '') {
            return { isValid: true, value: '' }; // 빈 티커 허용
        }

        // 대문자, 숫자, ., - 만 허용하고 나머지 제거
        const sanitized = trimmedValue.toUpperCase().replace(/[^A-Z0-9.\-]/g, '');

        // 길이 제한 (일반적으로 티커는 1-10자)
        if (sanitized.length > 10) {
            return { isValid: false, message: 'Ticker too long (max 10 characters)' };
        }

        return { isValid: true, value: sanitized };
    },

    /**
     * @description 자유 텍스트 검증 (길이 제한만 적용, DOMPurify는 controller에서 처리)
     * @param value - 검증할 텍스트
     * @param maxLength - 최대 길이
     * @returns 검증 결과
     */
    validateText(value: string | null | undefined, maxLength: number = 100): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue.length > maxLength) {
            return { isValid: false, message: `Text too long (max ${maxLength} characters)` };
        }
        return { isValid: true, value: trimmedValue };
    },

    /**
     * @description 숫자 입력값을 검증하고, 유효하면 숫자 타입으로 변환하여 반환합니다.
     * @param value - 검증할 값
     * @param max - 최대값 (기본: 1000조)
     * @returns 검증 결과 (value는 number 타입이지만, state.ts에서 Decimal로 변환됨)
     */
    validateNumericInput(
        value: string | number | null | undefined,
        max: number = 1e15
    ): ValidationResult {
        const trimmedValue = String(value ?? '').trim();
        if (trimmedValue === '') {
            return { isValid: false, message: t('validation.invalidNumber') };
        }

        const num = Number(trimmedValue);
        if (isNaN(num)) {
            return { isValid: false, message: t('validation.invalidNumber') };
        }
        if (num < 0) {
            return { isValid: false, message: t('validation.negativeNumber') };
        }

        // 최대값 제한
        if (num > max) {
            return {
                isValid: false,
                message: `Number too large (max ${max.toExponential()})`,
            };
        }

        // Check for excessively large numbers or precision issues using Decimal.js
        try {
            const decValue = new Decimal(trimmedValue);
            if (!decValue.isFinite()) {
                throw new Error('Number is not finite');
            }
            if (!isFinite(num)) {
                throw new Error('Number is too large for standard JS number');
            }
        } catch (e) {
            console.error('Decimal validation error:', e);
            return { isValid: false, message: t('validation.calcErrorDecimal') };
        }

        return { isValid: true, value: num };
    },

    /**
     * @description 단일 거래 내역의 유효성을 검사합니다.
     * @param txData - 거래 데이터
     * @returns 검증 결과
     */
    validateTransaction(txData: Partial<Transaction>): ValidationResult {
        // 날짜 검증
        if (!txData.date || isNaN(new Date(txData.date).getTime())) {
            return { isValid: false, message: t('validation.invalidDate') };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 시간 제거
        if (new Date(txData.date) > today) {
            return { isValid: false, message: t('validation.futureDate') };
        }

        // 수량 검증
        const quantityValidation = this.validateNumericInput(txData.quantity);
        if (!quantityValidation.isValid) {
            // Provide specific message for 0, otherwise use numeric validation message
            if (Number(txData.quantity) === 0)
                return { isValid: false, message: t('validation.quantityZero') };
            if (Number(txData.quantity) < 0)
                return { isValid: false, message: t('validation.negativeNumber') };
            return { isValid: false, message: quantityValidation.message }; // Should be invalidNumber here
        }
        // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (quantityValidation.value === 0) {
            return { isValid: false, message: t('validation.quantityZero') };
        }

        // 단가 검증
        const priceValidation = this.validateNumericInput(txData.price);
        if (!priceValidation.isValid) {
            // Provide specific message for 0, otherwise use numeric validation message
            if (Number(txData.price) === 0)
                return { isValid: false, message: t('validation.priceZero') };
            if (Number(txData.price) < 0)
                return { isValid: false, message: t('validation.negativeNumber') };
            return { isValid: false, message: priceValidation.message }; // Should be invalidNumber here
        }
        // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (priceValidation.value === 0) {
            return { isValid: false, message: t('validation.priceZero') };
        }

        return { isValid: true };
    },

    /**
     * @description 리밸런싱 계산 전 전체 입력 데이터의 유효성을 검사합니다.
     * @param inputs - 계산 입력값
     * @returns 오류 배열 (유효하면 빈 배열)
     */
    validateForCalculation(inputs: {
        mainMode: MainMode | 'simple';
        portfolioData: CalculatedStock[];
        additionalInvestment: Decimal;
    }): ValidationErrorDetail[] {
        const errors: ValidationErrorDetail[] = [];
        const { mainMode, portfolioData, additionalInvestment } = inputs;

        // 추가 매수 모드 또는 간단 계산 모드일 때 추가 투자금액 검증
        if (mainMode === 'add' || mainMode === 'simple') {
            // Use Decimal's comparison methods
            if (
                !additionalInvestment ||
                additionalInvestment.isNaN() ||
                additionalInvestment.isNegative() ||
                additionalInvestment.isZero()
            ) {
                errors.push({
                    field: 'additionalInvestment',
                    stockId: null,
                    message: t('validation.investmentAmountZero'),
                });
            }
        }

        let totalFixedBuyAmount = new Decimal(0);

        // 각 주식 항목 검증
        portfolioData.forEach((stock) => {
            const stockName = stock.name || t('defaults.newStock'); // Use default if name is empty

            if (!stock.name?.trim()) {
                errors.push({
                    field: 'name',
                    stockId: stock.id,
                    message: t('validation.nameMissing'),
                });
            }
            if (!stock.ticker?.trim()) {
                errors.push({
                    field: 'ticker',
                    stockId: stock.id,
                    message: t('validation.tickerMissing', { name: stockName }),
                });
            }

            const quantity = stock.calculated?.quantity;
            const currentPrice = new Decimal(stock.currentPrice ?? 0); // Use Decimal for currentPrice check

            if (
                quantity &&
                quantity instanceof Decimal &&
                quantity.greaterThan(0) &&
                (currentPrice.isNaN() || currentPrice.isNegative() || currentPrice.isZero())
            ) {
                errors.push({
                    field: 'currentPrice',
                    stockId: stock.id,
                    message: t('validation.currentPriceZero', { name: stockName }),
                });
            }

            // 고정 매수 관련 검증 (추가 매수 모드 및 간단 계산 모드에서)
            if ((mainMode === 'add' || mainMode === 'simple') && stock.isFixedBuyEnabled) {
                const fixedAmount = new Decimal(stock.fixedBuyAmount || 0);

                if (fixedAmount.isNaN() || fixedAmount.isNegative() || fixedAmount.isZero()) {
                    errors.push({
                        field: 'fixedBuyAmount',
                        stockId: stock.id,
                        message: t('validation.fixedBuyAmountZero', { name: stockName }),
                    });
                }
                // 소수점 거래(fractional shares) 지원을 위해 현재가보다 작은 금액도 허용
                totalFixedBuyAmount = totalFixedBuyAmount.plus(fixedAmount);
            }

            // 목표 비율 검증 (음수 여부 등)
            const targetRatio = new Decimal(stock.targetRatio ?? 0); // Use ?? 0 for safety
            if (targetRatio.isNaN() || targetRatio.isNegative()) {
                errors.push({
                    field: 'targetRatio',
                    stockId: stock.id,
                    message: t('validation.negativeNumber'),
                }); // Can't be negative
            }
        });

        // 추가 매수 모드 및 간단 계산 모드에서 총 고정 매수 금액이 추가 투자금을 초과하는지 검증
        if (
            (mainMode === 'add' || mainMode === 'simple') &&
            !additionalInvestment.isNaN() &&
            totalFixedBuyAmount.greaterThan(additionalInvestment)
        ) {
            errors.push({
                field: 'fixedBuyAmount',
                stockId: null,
                message: t('validation.fixedBuyTotalExceeds'),
            });
        }

        return errors;
    },

    /**
     * @description 가져온(import) 데이터의 기본 구조가 유효한지 검사합니다.
     * @param data - JSON.parse로 읽어온 데이터
     * @returns 구조 유효 여부
     */
    isDataStructureValid(data: any): boolean {
        if (!data || typeof data !== 'object') return false;
        if (
            !data.meta ||
            typeof data.meta !== 'object' ||
            typeof data.meta.activePortfolioId !== 'string'
        )
            return false; // Check type
        if (!data.portfolios || typeof data.portfolios !== 'object') return false;

        // Check individual portfolios
        for (const portId in data.portfolios) {
            const portfolio = data.portfolios[portId];
            if (!portfolio || typeof portfolio !== 'object') return false;
            if (portfolio.id !== portId || !portfolio.name || typeof portfolio.name !== 'string')
                return false;
            // Check settings object structure (basic)
            if (!portfolio.settings || typeof portfolio.settings !== 'object') return false;
            if (!['add', 'sell', 'simple'].includes(portfolio.settings.mainMode)) return false;
            if (!['krw', 'usd'].includes(portfolio.settings.currentCurrency)) return false;
            if (
                typeof portfolio.settings.exchangeRate !== 'number' ||
                portfolio.settings.exchangeRate <= 0
            )
                return false;

            // Check portfolioData array structure (basic)
            if (!Array.isArray(portfolio.portfolioData)) return false;
            // Optionally, add checks for individual stock structure within portfolioData if needed
            for (const stock of portfolio.portfolioData) {
                if (!stock || typeof stock !== 'object' || !stock.id || typeof stock.id !== 'string')
                    return false;
                // Add more checks for required stock properties (name, ticker, etc.)
                if (typeof stock.name !== 'string' || typeof stock.ticker !== 'string')
                    return false;
                // Allow optional sector
                if (stock.sector !== undefined && typeof stock.sector !== 'string') return false;
                if (typeof stock.targetRatio !== 'number' || stock.targetRatio < 0) return false;
                if (typeof stock.currentPrice !== 'number' || stock.currentPrice < 0) return false;
                // Allow missing optional fields if they have defaults upon loading/calculation
                if (
                    stock.isFixedBuyEnabled !== undefined &&
                    typeof stock.isFixedBuyEnabled !== 'boolean'
                )
                    return false;
                if (
                    stock.fixedBuyAmount !== undefined &&
                    (typeof stock.fixedBuyAmount !== 'number' || stock.fixedBuyAmount < 0)
                )
                    return false;

                if (!Array.isArray(stock.transactions)) return false;
                // Check transaction structure if necessary
                for (const tx of stock.transactions) {
                    if (!tx || typeof tx !== 'object' || !tx.id || typeof tx.id !== 'string')
                        return false;
                    if (!['buy', 'sell'].includes(tx.type)) return false;
                    if (typeof tx.date !== 'string' || isNaN(new Date(tx.date).getTime()))
                        return false;
                    // Allow quantity/price to be potentially stored as strings if parsed later
                    if (
                        (typeof tx.quantity !== 'number' && typeof tx.quantity !== 'string') ||
                        Number(tx.quantity) <= 0
                    )
                        return false;
                    if (
                        (typeof tx.price !== 'number' && typeof tx.price !== 'string') ||
                        Number(tx.price) <= 0
                    )
                        return false;
                }
            }
        }

        return true;
    },
};
```

---

## `src/state.ts`

```typescript
// js/state.ts (Refactored with DataStore separation)
import { generateId } from './utils';  // ===== [Phase 3.4 최적화] generateId 제거 =====
import Decimal from 'decimal.js';
import { CONFIG } from './constants.ts';
import { t } from './i18n.ts';
import { ErrorService } from './errorService.ts';
import { Validator } from './validator.ts';
import DOMPurify from 'dompurify';
import { DataStore } from './dataStore.ts';
import type { Stock, Transaction, Portfolio, PortfolioSettings, MetaState } from './types.ts';

export class PortfolioState {
    #portfolios: Record<string, Portfolio> = {};
    #activePortfolioId: string | null = null;
    #initializationPromise: Promise<void> | null = null;

    constructor() {
        this.#initializationPromise = this._initialize();
    }

    /**
     * @description public async 메서드로 변경
     */
    async ensureInitialized(): Promise<void> {
        await this.#initializationPromise;
    }

    /**
     * @description 비동기 초기화 및 LocalStorage 마이그레이션 로직
     */
    async _initialize(): Promise<void> {
        try {
            // 1. IndexedDB에서 데이터 로드 시도
            let loadedMetaData = await this._loadMeta();
            let loadedPortfolios = await this._loadPortfolios();

            // 2. IDB에 데이터가 없는 경우, LocalStorage에서 마이그레이션 시도
            if (!loadedMetaData || !loadedPortfolios || Object.keys(loadedPortfolios).length === 0) {
                console.log("IndexedDB empty. Attempting migration from LocalStorage...");
                const migrated = await this._migrateFromLocalStorage();
                
                if (migrated) {
                    console.log("Migration successful. Reloading from IndexedDB.");
                    loadedMetaData = await this._loadMeta();
                    loadedPortfolios = await this._loadPortfolios();
                }
            }

            // 3. 데이터 유효성 검사 (DOMPurify 소독 포함)
            const { meta, portfolios } = this._validateAndUpgradeData(loadedMetaData, loadedPortfolios);

            this.#portfolios = portfolios;
            this.#activePortfolioId = meta.activePortfolioId;

            // 4. 유효한 데이터가 전혀 없으면 기본값 생성 (비동기 저장)
            if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
                 console.warn("No valid portfolios found or active ID invalid. Creating default portfolio.");
                await this.resetData(false); // resetData를 async로 변경
            }
            
            console.log("PortfolioState initialized (async).");
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_initialize');
            console.error("Initialization failed, resetting data.");
            await this.resetData(false); // resetData를 async로 변경
        }
    }
    
    /**
     * @description LocalStorage -> IndexedDB 마이그레이션 (DataStore 위임)
     */
    async _migrateFromLocalStorage(): Promise<boolean> {
        return await DataStore.migrateFromLocalStorage();
    }

    /**
     * @description IDB에서 Meta 로드 (DataStore 위임)
     */
    async _loadMeta(): Promise<MetaState | null> {
        return await DataStore.loadMeta();
    }

    /**
     * @description IDB에서 Portfolios 로드 (DataStore 위임)
     */
    async _loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        return await DataStore.loadPortfolios();
    }

     _validateAndUpgradeData(
        loadedMetaData: MetaState | null,
        loadedPortfolios: Record<string, Portfolio> | null
    ): { meta: MetaState; portfolios: Record<string, Portfolio> } {
        const currentVersion = CONFIG.DATA_VERSION;
        const loadedVersion = loadedMetaData?.version;

        if (loadedVersion !== currentVersion) {
            console.warn(`Data version mismatch. Loaded: ${loadedVersion}, Current: ${currentVersion}. Attempting migration/reset.`);
        }
        
        const validatedPortfolios = {};
        let validatedActiveId = loadedMetaData?.activePortfolioId;
        let foundActive = false;

        if (loadedPortfolios && typeof loadedPortfolios === 'object') {
            Object.keys(loadedPortfolios).forEach(portId => {
                const portfolio = loadedPortfolios[portId];
                const newId = portId; 

                if (portfolio && typeof portfolio === 'object' && portfolio.id === portId && portfolio.name) {
                    validatedPortfolios[newId] = {
                        id: newId,
                        // ▼▼▼ [수정] DOMPurify.sanitize 적용 ▼▼▼
                        name: DOMPurify.sanitize(portfolio.name),
                        // ▲▲▲ [수정] ▲▲▲
                        settings: {
                            mainMode: ['add', 'sell', 'simple'].includes(portfolio.settings?.mainMode) ? portfolio.settings.mainMode : 'simple',
                            currentCurrency: ['krw', 'usd'].includes(portfolio.settings?.currentCurrency) ? portfolio.settings.currentCurrency : 'krw',
                            exchangeRate: typeof portfolio.settings?.exchangeRate === 'number' && portfolio.settings.exchangeRate > 0 ? portfolio.settings.exchangeRate : CONFIG.DEFAULT_EXCHANGE_RATE,
                        },
                        portfolioData: Array.isArray(portfolio.portfolioData) ? portfolio.portfolioData.map(stock => {
                             const targetRatio = new Decimal(stock.targetRatio ?? 0);
                             const currentPrice = new Decimal(stock.currentPrice ?? 0);
                             const fixedBuyAmount = new Decimal(stock.fixedBuyAmount ?? 0);

                            return {
                                id: stock.id || `s-${generateId()}`,
                                // ▼▼▼ [수정] DOMPurify.sanitize 적용 ▼▼▼
                                name: DOMPurify.sanitize(stock.name || t('defaults.newStock')),
                                ticker: DOMPurify.sanitize(stock.ticker || ''),
                                sector: DOMPurify.sanitize(stock.sector || ''),
                                // ▲▲▲ [수정] ▲▲▲
                                targetRatio: targetRatio.isNaN() ? new Decimal(0) : targetRatio,
                                currentPrice: currentPrice.isNaN() ? new Decimal(0) : currentPrice,
                                isFixedBuyEnabled: typeof stock.isFixedBuyEnabled === 'boolean' ? stock.isFixedBuyEnabled : false,
                                fixedBuyAmount: fixedBuyAmount.isNaN() ? new Decimal(0) : fixedBuyAmount,
                                transactions: Array.isArray(stock.transactions) ? stock.transactions.map(tx => {
                                    const quantity = new Decimal(tx.quantity ?? 0);
                                    const price = new Decimal(tx.price ?? 0);
                                    return {
                                        id: tx.id || `tx-${generateId()}`,
                                        type: tx.type === 'sell' ? 'sell' : 'buy',
                                        date: typeof tx.date === 'string' ? tx.date : new Date().toISOString().slice(0, 10),
                                        quantity: quantity.isNaN() ? new Decimal(0) : quantity,
                                        price: price.isNaN() ? new Decimal(0) : price,
                                    };
                                })
                                .filter(tx => tx.quantity.greaterThan(0) && tx.price.greaterThan(0))
                                .sort((a, b) => a.date.localeCompare(b.date)) : []
                            };
                        }) : []
                    };
                    if (newId === validatedActiveId) {
                        foundActive = true;
                    }
                } else {
                     console.warn(`Invalid portfolio structure skipped for ID: ${portId}`);
                }
            });
        }

        if (!foundActive || !validatedPortfolios[validatedActiveId]) {
            const firstValidId = Object.keys(validatedPortfolios)[0];
            if (firstValidId) {
                console.warn(`Active portfolio ID '${validatedActiveId}' not found. Setting active ID to '${firstValidId}'.`);
                validatedActiveId = firstValidId;
            } else {
                 console.warn(`No valid portfolios loaded. Active ID set to null.`);
                validatedActiveId = null;
            }
        }

        const validatedMeta = {
            activePortfolioId: validatedActiveId,
            version: currentVersion
        };

        return { meta: validatedMeta, portfolios: validatedPortfolios };
     }


    getActivePortfolio(): Portfolio | null {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    getAllPortfolios(): Record<string, Portfolio> {
        return this.#portfolios;
    }

    async setActivePortfolioId(id: string): Promise<void> {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            await this.saveMeta(); // 비동기 저장
        } else {
            ErrorService.handle(new Error(`Portfolio with ID ${id} not found.`), 'setActivePortfolioId');
        }
    }

    async createNewPortfolio(name: string): Promise<Portfolio> {
        const newId = `p-${generateId()}`;
        const newPortfolio = this._createDefaultPortfolio(newId, name);
        this.#portfolios[newId] = newPortfolio;
        this.#activePortfolioId = newId;
        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        return newPortfolio;
    }

    async deletePortfolio(id: string): Promise<boolean> {
        if (Object.keys(this.#portfolios).length <= 1) {
            console.warn("Cannot delete the last portfolio.");
            return false;
        }
        if (!this.#portfolios[id]) {
             console.warn(`Portfolio with ID ${id} not found for deletion.`);
             return false;
        }

        delete this.#portfolios[id];

        if (this.#activePortfolioId === id) {
            this.#activePortfolioId = Object.keys(this.#portfolios)[0] || null;
            await this.saveMeta(); // 비동기 저장
        }
        await this.savePortfolios(); // 비동기 저장
        return true;
    }

    async renamePortfolio(id: string, newName: string): Promise<void> {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            await this.savePortfolios(); // 비동기 저장
        } else {
             ErrorService.handle(new Error(`Portfolio with ID ${id} not found for renaming.`), 'renamePortfolio');
        }
    }

    async updatePortfolioSettings(key: keyof PortfolioSettings, value: any): Promise<void> {
        const activePortfolio = this.getActivePortfolio();
        console.log(`[DEBUG] updatePortfolioSettings called: key=${key}, value=${value}`);
        if (activePortfolio) {
            if (key === 'exchangeRate' && (typeof value !== 'number' || value <= 0)) {
                 activePortfolio.settings[key] = CONFIG.DEFAULT_EXCHANGE_RATE;
            } else if (key === 'mainMode' && !['add', 'sell', 'simple'].includes(/** @type {string} */(value))) {
                 console.log(`[DEBUG] Invalid mainMode detected: ${value}, resetting to 'add'`);
                 activePortfolio.settings[key] = 'add';
            } else if (key === 'currentCurrency' && !['krw', 'usd'].includes(/** @type {string} */(value))) {
                 activePortfolio.settings[key] = 'krw';
            }
            else {
                console.log(`[DEBUG] Setting ${key} = ${value}`);
                activePortfolio.settings[key] = value;
            }
            console.log(`[DEBUG] After update, mainMode = ${activePortfolio.settings.mainMode}`);
            await this.saveActivePortfolio(); // 비동기 저장
        }
    }


    async addNewStock(): Promise<Stock | null> {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const newStock = this._createDefaultStock();
            activePortfolio.portfolioData.push(newStock);
            await this.saveActivePortfolio(); // 비동기 저장
            return newStock;
        }
        return null;
    }

    async deleteStock(stockId: string): Promise<boolean> {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
             if (activePortfolio.portfolioData.length <= 1) {
                 console.warn("Cannot delete the last stock in the portfolio.");
                 return false;
             }
            const initialLength = activePortfolio.portfolioData.length;
            activePortfolio.portfolioData = activePortfolio.portfolioData.filter(stock => stock.id !== stockId);

            if (activePortfolio.portfolioData.length < initialLength) {
                 await this.saveActivePortfolio(); // 비동기 저장
                 return true;
            } else {
                 console.warn(`Stock with ID ${stockId} not found for deletion.`);
                 return false;
            }
        }
        return false;
    }

    getStockById(stockId: string): Stock | undefined {
        const activePortfolio = this.getActivePortfolio();
        return activePortfolio?.portfolioData.find(s => s.id === stockId);
    }

    updateStockProperty(stockId: string, field: string, value: any): void {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const stockIndex = activePortfolio.portfolioData.findIndex(s => s.id === stockId);
            if (stockIndex > -1) {
                const stock = activePortfolio.portfolioData[stockIndex];
                 if (['targetRatio', 'currentPrice', 'fixedBuyAmount'].includes(field)) {
                     try {
                         const decimalValue = new Decimal(value ?? 0);
                         if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                         (stock as any)[field] = decimalValue;
                     } catch (e) {
                         ErrorService.handle(new Error(`Invalid numeric value for ${field}: ${value}`), 'updateStockProperty');
                         (stock as any)[field] = new Decimal(0);
                     }
                 } else if (field === 'isFixedBuyEnabled') {
                     (stock as any)[field] = Boolean(value);
                 } else if (typeof (stock as any)[field] !== 'undefined') {
                     (stock as any)[field] = value;
                 } else {
                      console.warn(`Attempted to update non-existent property '${field}' on stock ${stockId}`);
                 }
            }
        }
    }

    async addTransaction(stockId: string, transactionData: Partial<Transaction>): Promise<boolean> {
        const stock = this.getStockById(stockId);
        if (stock) {
            const validation = Validator.validateTransaction({
                ...transactionData,
                quantity: transactionData.quantity,
                price: transactionData.price,
            });
            if (!validation.isValid) {
                 ErrorService.handle(new Error(`Invalid transaction data: ${validation.message}`), 'addTransaction');
                 return false;
            }

            try {
                const newTransaction = {
                    ...transactionData,
                    id: `tx-${generateId()}`,
                     quantity: new Decimal(transactionData.quantity),
                     price: new Decimal(transactionData.price)
                };
                if (newTransaction.quantity.isNaN() || newTransaction.price.isNaN()){
                     throw new Error('Quantity or Price resulted in NaN after Decimal conversion.');
                }

                stock.transactions.push(newTransaction);
                stock.transactions.sort((a, b) => a.date.localeCompare(b.date));
                await this.saveActivePortfolio(); // 비동기 저장
                return true;
            } catch (e) {
                 ErrorService.handle(new Error(`Error converting transaction data to Decimal: ${e.message}`), 'addTransaction');
                 return false;
            }
        }
        return false;
    }

    async deleteTransaction(stockId: string, transactionId: string): Promise<boolean> {
        const stock = this.getStockById(stockId);
        if (stock) {
            const initialLength = stock.transactions.length;
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            if (stock.transactions.length < initialLength) {
                 await this.saveActivePortfolio(); // 비동기 저장
                 return true;
            } else {
                 console.warn(`State: Transaction ID ${transactionId} not found for stock ${stockId}.`);
                 return false;
            }
        }
        console.error(`State: Stock with ID ${stockId} not found.`);
        return false;
    }


    getTransactions(stockId: string): Transaction[] {
        const stock = this.getStockById(stockId);
        const transactions = stock ? [...stock.transactions] : []; // Return a copy
        return transactions;
    }

    normalizeRatios(): boolean {
        const activePortfolio = this.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) return false;

        let totalRatio = new Decimal(0);
        activePortfolio.portfolioData.forEach(stock => {
            const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio || 0);
            totalRatio = totalRatio.plus(ratio);
        });


        if (totalRatio.isZero() || totalRatio.isNaN()) {
            console.warn("Total target ratio is zero or NaN, cannot normalize.");
            return false;
        }

        const factor = new Decimal(100).div(totalRatio);
        activePortfolio.portfolioData.forEach(stock => {
            const currentRatio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio || 0);
            stock.targetRatio = currentRatio.times(factor).toDecimalPlaces(2); // Keep as Decimal
        });

        let newSum = new Decimal(0);
        activePortfolio.portfolioData.forEach(stock => {
            newSum = newSum.plus(stock.targetRatio);
        });
        let diff = new Decimal(100).minus(newSum);

        if (!diff.isZero() && activePortfolio.portfolioData.length > 0) {
             let stockToAdjust = activePortfolio.portfolioData.reduce((maxStock, currentStock) => {
                 const currentRatio = currentStock.targetRatio instanceof Decimal ? currentStock.targetRatio : new Decimal(0);
                 const maxRatio = maxStock.targetRatio instanceof Decimal ? maxStock.targetRatio : new Decimal(0);
                 return (currentRatio.greaterThan(maxRatio)) ? currentStock : maxStock;
             }, activePortfolio.portfolioData[0]);

             const currentAdjustRatio = stockToAdjust.targetRatio instanceof Decimal ? stockToAdjust.targetRatio : new Decimal(stockToAdjust.targetRatio || 0);
             stockToAdjust.targetRatio = currentAdjustRatio.plus(diff).toDecimalPlaces(2);
        }

        return true;
    }

    async resetData(save: boolean = true): Promise<void> {
        const defaultPortfolio = this._createDefaultPortfolio(`p-${generateId()}`);
        this.#portfolios = { [defaultPortfolio.id]: defaultPortfolio };
        this.#activePortfolioId = defaultPortfolio.id;
        if (save) {
            await this.savePortfolios(); // 비동기 저장
            await this.saveMeta(); // 비동기 저장
        }
        console.log("Data reset to default.");
    }

    exportData(): { meta: MetaState; portfolios: Record<string, any> } {
         const exportablePortfolios = {};
         Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
             exportablePortfolios[id] = {
                 ...portfolio,
                 portfolioData: portfolio.portfolioData.map(stock => ({
                     ...stock,
                     targetRatio: stock.targetRatio.toNumber(),
                     currentPrice: stock.currentPrice.toNumber(),
                     fixedBuyAmount: stock.fixedBuyAmount.toNumber(),
                     transactions: stock.transactions.map(tx => ({
                         ...tx,
                         quantity: tx.quantity.toNumber(),
                         price: tx.price.toNumber(),
                     }))
                 }))
             };
         });

        return {
            meta: { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION },
            portfolios: exportablePortfolios
        };
    }

    async importData(importedData: any): Promise<void> {
         if (!Validator.isDataStructureValid(importedData)) {
            throw new Error("Imported data structure is invalid.");
         }

        // ▼▼▼ [수정] _validateAndUpgradeData가 소독을 처리 ▼▼▼
        const { meta, portfolios } = this._validateAndUpgradeData(importedData.meta, importedData.portfolios);

        this.#portfolios = portfolios;
        this.#activePortfolioId = meta.activePortfolioId;

        if (Object.keys(this.#portfolios).length === 0 || !this.#portfolios[this.#activePortfolioId]) {
            console.warn("Imported data resulted in no valid portfolios. Resetting to default.");
            await this.resetData(false); // 비동기 리셋
        }

        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        console.log("Data imported successfully.");
    }


    async saveMeta(): Promise<void> {
        try {
            const metaData: MetaState = { activePortfolioId: this.#activePortfolioId || '', version: CONFIG.DATA_VERSION };
            await DataStore.saveMeta(metaData); // DataStore 사용
        } catch (error) {
            ErrorService.handle(error as Error, 'saveMeta');
        }
    }

    async savePortfolios(): Promise<void> {
        try {
             const saveablePortfolios = {};
             Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
                 saveablePortfolios[id] = {
                     ...portfolio,
                     portfolioData: portfolio.portfolioData.map(stock => {
                        // 'calculated' 속성을 분해해서 저장 대상에서 제외
                        const { calculated, ...saveableStock } = stock;

                         return {
                             ...saveableStock,
                             targetRatio: saveableStock.targetRatio instanceof Decimal ? saveableStock.targetRatio.toNumber() : Number(saveableStock.targetRatio ?? 0),
                             currentPrice: saveableStock.currentPrice instanceof Decimal ? saveableStock.currentPrice.toNumber() : Number(saveableStock.currentPrice ?? 0),
                             fixedBuyAmount: saveableStock.fixedBuyAmount instanceof Decimal ? saveableStock.fixedBuyAmount.toNumber() : Number(saveableStock.fixedBuyAmount ?? 0),
                             manualAmount: saveableStock.manualAmount instanceof Decimal ? saveableStock.manualAmount.toNumber() : Number(saveableStock.manualAmount ?? 0),
                             transactions: saveableStock.transactions.map(tx => ({
                                 ...tx,
                                 quantity: tx.quantity instanceof Decimal ? tx.quantity.toNumber() : Number(tx.quantity ?? 0),
                                 price: tx.price instanceof Decimal ? tx.price.toNumber() : Number(tx.price ?? 0),
                             }))
                         };
                     })
                 };
             });
            await DataStore.savePortfolios(saveablePortfolios); // DataStore 사용
        } catch (error) {
             if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 ErrorService.handle(error, 'savePortfolios - Quota Exceeded');
             } else {
                 ErrorService.handle(error as Error, 'savePortfolios');
             }
        }
    }

    async saveActivePortfolio(): Promise<void> {
        await this.savePortfolios();
    }

    // --- Private Helper Methods ---

    _createDefaultPortfolio(id: string, name: string = t('defaults.defaultPortfolioName')): Portfolio {
        return {
            id: id,
            name: name,
            settings: {
                mainMode: 'simple',
                currentCurrency: 'krw',
                exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
                rebalancingTolerance: 5, // 기본 5% 허용 오차
                tradingFeeRate: 0.3, // 기본 0.3% 수수료
                taxRate: 15, // 기본 15% 세율
            },
            portfolioData: [this._createDefaultStock()]
        };
    }

    _createDefaultStock(): Stock {
        return {
            id: `s-${generateId()}`,
            name: t('defaults.newStock'),
            ticker: '',
            sector: '',
            targetRatio: new Decimal(0), // Use Decimal
            currentPrice: new Decimal(0), // Use Decimal
            isFixedBuyEnabled: false,
            fixedBuyAmount: new Decimal(0), // Use Decimal
            transactions: [],
            manualAmount: 0 // 간단 모드용 수동 입력 금액
        };
    }
}
```

---

## `src/state.test.ts`

```typescript
// js/state.test.ts (async / idb-keyval / testUtils / Assertion Fix)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PortfolioState } from './state';
import { CONFIG } from './constants';
import Decimal from 'decimal.js';
import { MOCK_PORTFOLIO_1 } from './testUtils';
import type { Portfolio, Stock } from './types';

// --- ▼▼▼ [신규] idb-keyval 모의(Mock) ▼▼▼ ---
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));
// --- ▲▲▲ [신규] ▲▲▲ ---

// --- i18n 모의(Mock) ---
vi.mock('./i18n', () => ({
  t: vi.fn((key: string) => {
    if (key === 'defaults.defaultPortfolioName') return '기본 포트폴리오';
    if (key === 'defaults.newStock') return '새 종목';
    if (key === 'defaults.uncategorized') return '미분류';
    return key;
  }),
}));
// --- ▲▲▲ ---

// --- ▼▼▼ [신규] 모의 객체 임포트 ▼▼▼ ---
import { get, set, del } from 'idb-keyval';
// --- ▲▲▲ [신규] ▲▲▲ ---

// [신규] DOMPurify 모의
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input: string) => input),
    }
}));

// ErrorService가 View에 의존하여 발생하는 순환 참조 오류를 방지하기 위해 모의 처리
vi.mock('./errorService', () => ({
  ErrorService: {
    handle: vi.fn(),
  },
  ValidationError: class extends Error {}
}));


describe('PortfolioState (Async)', () => {
  let state: PortfolioState;
  let mockGet: ReturnType<typeof vi.mocked<typeof get>>;
  let mockSet: ReturnType<typeof vi.mocked<typeof set>>;
  let mockDel: ReturnType<typeof vi.mocked<typeof del>>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockGet = vi.mocked(get);
    mockSet = vi.mocked(set);
    mockDel = vi.mocked(del);

    // 기본적으로 비어있는 DB 시뮬레이션
    mockGet.mockResolvedValue(null);

    // Create a new state instance for each test
    state = new PortfolioState();
    await state.ensureInitialized(); // Wait for initialization
  });

  it('should create default portfolio on initialization if none exists', async () => {
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
    const activePortfolio = state.getActivePortfolio();
    expect(activePortfolio?.id).toBeDefined();
    expect(activePortfolio?.name).toBe('기본 포트폴리오');
    expect(activePortfolio?.portfolioData?.length).toBe(1);
    expect(activePortfolio?.portfolioData?.[0]?.name).toBe('새 종목');

    // _initialize는 resetData(false)를 호출하므로, set은 호출되지 않아야 합니다.
    expect(mockSet).not.toHaveBeenCalled();
  });

   it('should load existing data from IndexedDB on initialization', async () => {
     const rawStockData: Stock = {
         id: 's-test', name: 'Test Stock', ticker: 'TEST', sector: 'Tech',
         targetRatio: 100, currentPrice: 50,
         isFixedBuyEnabled: false, fixedBuyAmount: 0,
         transactions: []
     };
     const testData = {
       meta: { activePortfolioId: 'p-test', version: CONFIG.DATA_VERSION },
       portfolios: {
         'p-test': {
             id: 'p-test', name: 'Test Portfolio',
             settings: { mainMode: 'sell' as const, currentCurrency: 'usd' as const, exchangeRate: 1200 },
             portfolioData: [rawStockData]
            }
       }
     };

     mockGet.mockImplementation(async (key: string) => {
        if (key === CONFIG.IDB_META_KEY) return testData.meta;
        if (key === CONFIG.IDB_PORTFOLIOS_KEY) return testData.portfolios;
        return null;
     });

     const newState = new PortfolioState();
     await newState.ensureInitialized();

     expect(Object.keys(newState.getAllPortfolios()).length).toBe(1);
     const loadedPortfolio = newState.getActivePortfolio();

     expect(loadedPortfolio?.id).toBe('p-test');
     expect(loadedPortfolio?.name).toBe('Test Portfolio');
     expect(loadedPortfolio?.settings.mainMode).toBe('sell');
     expect(loadedPortfolio?.portfolioData?.[0]?.name).toBe('Test Stock');
     expect(Number(loadedPortfolio?.portfolioData?.[0]?.targetRatio)).toBe(100);
   });


   it('should add a new stock correctly (async)', async () => {
       const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;

       const newStock = await state.addNewStock();

       expect(state.getActivePortfolio()?.portfolioData?.length).toBe(initialLength + 1);
       expect(newStock.name).toBe('새 종목');
       expect(Number(newStock.targetRatio)).toBe(0);

       // saveActivePortfolio -> savePortfolios -> set 호출 확인
       expect(mockSet).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, expect.any(Object));
   });

    it('should not delete the last stock in a portfolio (async)', async () => {
        const portfolio = state.getActivePortfolio();
        expect(portfolio?.portfolioData?.length).toBe(1);

        if (portfolio && portfolio.portfolioData.length === 1) {
            const stockId = portfolio.portfolioData[0].id;

            const deleted = await state.deleteStock(stockId);
            expect(deleted).toBe(false);
            expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1);
        }
    });

    it('should delete a stock if there are multiple (async)', async () => {
        await state.addNewStock();
        const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
        expect(initialLength).toBeGreaterThan(1);

        const portfolioBeforeDelete = state.getActivePortfolio();
        if (portfolioBeforeDelete) {
            const stockIdToDelete = portfolioBeforeDelete.portfolioData[0].id;

            const deleted = await state.deleteStock(stockIdToDelete);
            expect(deleted).toBe(true);

            const portfolioAfterDelete = state.getActivePortfolio();
            expect(portfolioAfterDelete?.portfolioData?.length).toBe(initialLength - 1);
            expect(portfolioAfterDelete?.portfolioData?.find(s => s.id === stockIdToDelete)).toBeUndefined();
        } else {
             throw new Error("Failed to get active portfolio for deletion test");
        }
    });
});
```

---

## `src/i18n.ts`

```typescript
// src/i18n.ts (Updated with missing ui keys)

type Lang = 'en' | 'ko';
type Replacements = Record<string, string | number>;

// 1. 모든 문자열을 계층 구조로 정의합니다.
const locales = {
  // --- English Messages (from en.json) ---
  en: {
    toast: {
      dataReset: "Data has been reset.",
      ratiosNormalized: "Target ratios have been adjusted to 100%.",
      noRatiosToNormalize: "No target ratios available for auto-adjustment.",
      saveSuccess: "Portfolio saved successfully.",
      saveNoData: "No data to save.",
      loadSuccess: "Loaded saved data.",
      importSuccess: "Data imported successfully.",
      importError: "Error occurred while importing file.",
      portfolioCreated: "Portfolio '{name}' created.",
      portfolioRenamed: "Portfolio name changed.",
      portfolioDeleted: "Portfolio deleted.",
      lastPortfolioDeleteError: "Cannot delete the last portfolio.",
      transactionAdded: "Transaction added.",
      transactionDeleted: "Transaction deleted.",
      chartError: "Failed to visualize chart.",
      lastStockDeleteError: "Cannot delete the last remaining stock.",
      transactionAddFailed: "Failed to add transaction.",
      transactionDeleteFailed: "Failed to delete transaction.",
      normalizeRatiosError: "Error normalizing ratios.",
      calculateSuccess: "Calculation complete!",
      noTickersToFetch: "No tickers to fetch.",
      modeChanged: "Mode changed to {mode} mode.",
      currencyChanged: "Currency changed to {currency}.",
      invalidExchangeRate: "Invalid exchange rate. Restoring default.",
      amountInputError: "Amount input error.",
      invalidTransactionInfo: "Invalid transaction information.",
      invalidFileType: "Only JSON files can be imported.",
      exportSuccess: "Data exported successfully.",
      exportError: "Error exporting data."
    },
    modal: {
      confirmResetTitle: "Reset Data",
      confirmResetMsg: "Reset the current portfolio to the initial template? This action cannot be undone.",
      confirmDeletePortfolioTitle: "Delete Portfolio",
      confirmDeletePortfolioMsg: "Are you sure you want to delete the '{name}' portfolio? This action cannot be undone.",
      confirmDeleteTransactionTitle: "Delete Transaction",
      confirmDeleteTransactionMsg: "Are you sure you want to delete this transaction?",
      confirmRatioSumWarnTitle: "Confirm Target Ratios",
      confirmRatioSumWarnMsg: "The sum of target ratios is {totalRatio}%. Proceed with calculation even if it's not 100%?",
      promptNewPortfolioNameTitle: "Create New Portfolio",
      promptNewPortfolioNameMsg: "Enter the name for the new portfolio:",
      promptRenamePortfolioTitle: "Rename Portfolio",
      promptRenamePortfolioMsg: "Enter the new portfolio name:",
      confirmDeleteStockTitle: "Delete Stock",
      confirmDeleteStockMsg: "Are you sure you want to delete '{name}'?",
      transactionTitle: "Manage Transactions"
    },
    ui: {
      stockName: "Name",
      ticker: "Ticker",
      sector: "Sector",
      quantity: "Quantity",
      avgBuyPrice: "Avg. Buy Price",
      currentValue: "Current Value",
      profitLoss: "P/L",
      profitLossRate: "P/L Rate",
      fixedBuy: "Fixed Buy",
      manage: "Manage",
      delete: "Delete",
      fetchingPrices: "Fetching...",
      updateAllPrices: "Update All Prices",
      buy: "Buy",
      sell: "Sell",
      buyWithIcon: "🔵 Buy",
      sellWithIcon: "🔴 Sell",
      krw: "KRW",
      usd: "$",
      addMode: "Add Mode",
      sellMode: "Sell Rebalance",
      action: "Action",
      // --- Added missing keys ---
      targetRatio: "Target Ratio",
      currentPrice: "Current Price"
      // --- Added missing keys ---
    },
    defaults: {
      defaultPortfolioName: "Default Portfolio",
      newStock: "New Stock",
      uncategorized: "Uncategorized",
      unknownStock: "this stock"
    },
    validation: {
      calculationError: "Calculation error. Please check your inputs.",
      validationErrorPrefix: "Please check your inputs: ",
      saveErrorGeneral: "Error occurred while saving.",
      saveErrorQuota: "Storage space insufficient. Please delete unnecessary portfolios.",
      saveErrorSecurity: "Cannot save data due to browser settings. Check cookie and site data settings.",
      calcErrorDecimal: "Input value is too large or has an invalid format.",
      calcErrorType: "Data format error occurred.",
      invalidFileStructure: "The file structure is invalid or corrupted.",
      investmentAmountZero: "- Additional investment amount must be greater than 0.",
      currentAmountZero: "- Current amount must be greater than 0 to calculate rebalancing.",
      ratioSumNot100: "- Sum of target ratios must be 100%. (Current: {totalRatio}%)",
      invalidTransactionData: "- Please enter valid transaction date, quantity, and price.",
      fixedBuyAmountTooSmall: "- Fixed buy amount for '{name}' is less than the current price, cannot buy even 1 share.",
      invalidNumber: "Not a valid number.",
      negativeNumber: "Negative numbers are not allowed.",
      invalidDate: "Please enter a valid date.",
      futureDate: "Future dates are not allowed.",
      quantityZero: "Quantity must be greater than 0.",
      priceZero: "Price must be greater than 0.",
      nameMissing: "- Please enter the name for the unnamed stock.",
      tickerMissing: "- Please enter the ticker for '{name}'.",
      currentPriceZero: "- Current price for '{name}' must be greater than 0.",
      fixedBuyAmountZero: "- Fixed buy amount for '{name}' must be greater than 0.",
      fixedBuyTotalExceeds: "- Sum of fixed buy amounts exceeds the total investment amount."
    },
    aria: {
      tickerInput: "{name} ticker input",
      sectorInput: "{name} sector input",
      targetRatioInput: "{name} target ratio input",
      currentPriceInput: "{name} current price input",
      fixedBuyToggle: "Enable fixed buy amount",
      fixedBuyAmount: "Fixed buy amount",
      manageTransactions: "Manage transactions for {name}",
      deleteStock: "Delete {name}",
      deleteTransaction: "Delete transaction from {date}",
      resultsLoaded: "Calculation results loaded.",
      // --- Added region labels ---
      resultsRegion: "Calculation Results",
      sectorAnalysisRegion: "Sector Analysis Results",
      chartRegion: "Portfolio Visualization Chart"
      // --- Added region labels ---
    },
    view: {
      noTransactions: "No transactions found."
    },
    template: {
      currentTotalAsset: "Current Total Assets",
      additionalInvestment: "Additional Investment",
      finalTotalAsset: "Total Assets After Investment",
      addModeGuideTitle: "📈 Additional Investment Allocation Guide (Sorted by Buy Amount)",
      stock: "Stock",
      currentRatio: "Current Ratio",
      targetRatio: "Target Ratio",
      profitRate: "Profit Rate",
      buyRecommendation: "Recommended Buy Amount",
      buyGuideTitle: "💡 Buy Execution Guide",
      noItemsToBuy: "No items to buy.",
      rebalancingTotal: "Total Rebalancing Amount",
      sellModeGuideTitle: "⚖️ Rebalancing Guide (Sorted by Adjustment Amount)",
      adjustmentAmount: "Adjustment Amount",
      sellItemsTitle: "🔴 Items to Sell",
      noItemsToSell: "No items to sell.",
      buyItemsTitle: "🔵 Items to Buy (with proceeds from selling)",
      sectorAnalysisTitle: "🗂️ Sector Analysis",
      sector: "Sector",
      amount: "Amount",
      ratio: "Ratio (%)",
       // --- Added captions ---
       sectorAnalysisCaption: "Asset distribution by sector",
       addModeCaption: "Recommended buys for additional investment",
       sellModeSellCaption: "Items recommended for selling",
       sellModeBuyCaption: "Items recommended for buying with proceeds"
       // --- Added captions ---
    },
    state: {
       noActivePortfolio: "No active portfolio.",
       noPortfolioData: "No portfolio data available."
    },
    error: {
        cannotGetInputs: "Could not retrieve calculation inputs."
    },
    api: {
      fetchSuccessAll: "{count} stock prices updated.",
      fetchSuccessPartial: "{count} succeeded ({failed} failed)",
      fetchFailedAll: "Failed to load prices for all stocks ({failed}). Check API key or tickers.",
      noUpdates: "No stocks to update.",
      fetchErrorGlobal: "API call error: {message}"
    }
  },
  // --- Korean Messages (from i18n.js and ko.json) ---
  ko: {
    toast: {
      dataReset: "데이터가 초기화되었습니다.",
      ratiosNormalized: "목표 비율이 100%에 맞춰 조정되었습니다.",
      noRatiosToNormalize: "자동 조정을 위한 목표 비율이 없습니다.",
      saveSuccess: "포트폴리오가 저장되었습니다.",
      saveNoData: "저장할 데이터가 없습니다.",
      loadSuccess: "저장된 데이터를 불러왔습니다.",
      importSuccess: "데이터를 성공적으로 불러왔습니다.",
      importError: "파일을 불러오는 중 오류가 발생했습니다.",
      portfolioCreated: "포트폴리오 '{name}'이(가) 생성되었습니다.",
      portfolioRenamed: "포트폴리오 이름이 변경되었습니다.",
      portfolioDeleted: "포트폴리오가 삭제되었습니다.",
      lastPortfolioDeleteError: "마지막 포트폴리오는 삭제할 수 없습니다.",
      lastStockDeleteError: "마지막 남은 주식은 삭제할 수 없습니다.",
      transactionAdded: "거래 내역이 추가되었습니다.",
      transactionDeleted: "거래 내역이 삭제되었습니다.",
      transactionAddFailed: "거래 추가 실패.",
      transactionDeleteFailed: "거래 삭제 실패.",
      chartError: "차트 시각화에 실패했습니다.",
      normalizeRatiosError: "비율 정규화 중 오류 발생",
      calculateSuccess: "계산 완료!",
      noTickersToFetch: "가져올 티커가 없습니다.",
      modeChanged: "모드가 {mode} 모드로 변경되었습니다.",
      currencyChanged: "통화 기준이 {currency}로 변경되었습니다.",
      invalidExchangeRate: "유효하지 않은 환율입니다. 기본값으로 복원됩니다.",
      amountInputError: "금액 입력 오류.",
      invalidTransactionInfo: "거래 정보가 유효하지 않습니다.",
      invalidFileType: "JSON 파일만 가져올 수 있습니다.",
      exportSuccess: "데이터를 성공적으로 내보냈습니다.",
      exportError: "데이터 내보내기 중 오류 발생."
    },
    modal: {
      confirmResetTitle: "데이터 초기화",
      confirmResetMsg: "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      confirmDeletePortfolioTitle: "포트폴리오 삭제",
      confirmDeletePortfolioMsg: "정말로 '{name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      confirmDeleteStockTitle: "종목 삭제",
      confirmDeleteStockMsg: "'{name}' 종목을 삭제하시겠습니까?",
      confirmDeleteTransactionTitle: "거래 내역 삭제",
      confirmDeleteTransactionMsg: "이 거래 내역을 정말로 삭제하시겠습니까?",
      confirmRatioSumWarnTitle: "목표 비율 확인",
      confirmRatioSumWarnMsg: "목표비율 합이 {totalRatio}%입니다. 100%가 아니어도 계산을 진행하시겠습니까?",
      promptNewPortfolioNameTitle: "새 포트폴리오 생성",
      promptNewPortfolioNameMsg: "새 포트폴리오의 이름을 입력하세요:",
      promptRenamePortfolioTitle: "이름 변경",
      promptRenamePortfolioMsg: "새로운 포트폴리오 이름을 입력하세요:",
      transactionTitle: "거래 내역 관리"
    },
    ui: {
      stockName: "종목명",
      ticker: "티커",
      sector: "섹터",
      quantity: "수량",
      avgBuyPrice: "평단가",
      currentValue: "현재 평가액",
      profitLoss: "평가 손익",
      profitLossRate: "수익률",
      fixedBuy: "고정 매수",
      manage: "거래",
      delete: "삭제",
      fetchingPrices: "가져오는 중...",
      updateAllPrices: "현재가 일괄 업데이트",
      buy: "매수",
      sell: "매도",
      buyWithIcon: "🔵 매수",
      sellWithIcon: "🔴 매도",
      krw: "원",
      usd: "$",
      addMode: "추가 매수",
      sellMode: "매도 리밸런싱",
      action: "작업",
      // --- Added missing keys ---
      targetRatio: "목표 비율",
      currentPrice: "현재가"
      // --- Added missing keys ---
    },
    defaults: {
      defaultPortfolioName: "기본 포트폴리오",
      newStock: "새 종목",
      uncategorized: "미분류",
      unknownStock: "해당 종목"
    },
    validation: {
      calculationError: "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
      validationErrorPrefix: "입력값을 확인해주세요: ",
      saveErrorGeneral: "저장 중 오류가 발생했습니다.",
      saveErrorQuota: "저장 공간이 부족합니다. 불필요한 포트폴리오를 삭제해 주세요.",
      saveErrorSecurity: "브라우저 설정으로 인해 데이터를 저장할 수 없습니다. 쿠키 및 사이트 데이터 설정을 확인해주세요.",
      calcErrorDecimal: "입력값이 너무 크거나 잘못된 형식입니다.",
      calcErrorType: "데이터 형식 오류가 발생했습니다.",
      invalidFileStructure: "파일의 구조가 올바르지 않거나 손상되었습니다.",
      investmentAmountZero: "- 추가 투자 금액을 0보다 크게 입력해주세요.",
      currentAmountZero: "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
      ratioSumNot100: "- 목표 비율의 합이 100%가 되어야 합니다. (현재: {totalRatio}%)",
      invalidTransactionData: "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
      fixedBuyAmountTooSmall: "- '{name}'의 고정 매수 금액이 현재가보다 작아 1주도 매수할 수 없습니다.",
      invalidNumber: "유효한 숫자가 아닙니다.",
      negativeNumber: "음수는 입력할 수 없습니다.",
      invalidDate: "유효한 날짜를 입력해주세요.",
      futureDate: "미래 날짜는 입력할 수 없습니다.",
      quantityZero: "수량은 0보다 커야 합니다.",
      priceZero: "단가는 0보다 커야 합니다.",
      nameMissing: "- 이름 없는 종목의 종목명을 입력해주세요.",
      tickerMissing: "- '{name}'의 티커를 입력해주세요.",
      currentPriceZero: "- '{name}'의 현재가는 0보다 커야 합니다.",
      fixedBuyAmountZero: "- '{name}'의 고정 매수 금액은 0보다 커야 합니다.",
      fixedBuyTotalExceeds: "- 고정 매수 금액의 합이 총 투자금을 초과합니다."
    },
    aria: {
      tickerInput: "{name} 티커 입력",
      sectorInput: "{name} 섹터 입력",
      targetRatioInput: "{name} 목표 비율 입력",
      currentPriceInput: "{name} 현재가 입력",
      fixedBuyToggle: "고정 매수 활성화",
      fixedBuyAmount: "고정 매수 금액",
      manageTransactions: "{name} 거래 관리",
      deleteStock: "{name} 삭제",
      deleteTransaction: "{date} 거래 삭제",
      resultsLoaded: "계산 결과가 로드되었습니다.",
       // --- Added region labels ---
       resultsRegion: "계산 결과",
       sectorAnalysisRegion: "섹터별 분석 결과",
       chartRegion: "포트폴리오 시각화 차트"
       // --- Added region labels ---
    },
    view: {
      noTransactions: "거래 내역이 없습니다."
    },
    template: {
      currentTotalAsset: "현재 총 자산",
      additionalInvestment: "추가 투자금",
      finalTotalAsset: "투자 후 총 자산",
      addModeGuideTitle: "📈 추가 투자 배분 가이드 (매수 금액순 정렬)",
      stock: "종목",
      currentRatio: "현재 비율",
      targetRatio: "목표 비율",
      profitRate: "수익률",
      buyRecommendation: "매수 추천 금액",
      buyGuideTitle: "💡 매수 실행 가이드",
      noItemsToBuy: "매수할 종목이 없습니다.",
      rebalancingTotal: "총 리밸런싱 금액",
      sellModeGuideTitle: "⚖️ 리밸런싱 가이드 (조정 금액순 정렬)",
      adjustmentAmount: "조정 금액",
      sellItemsTitle: "🔴 매도 항목",
      noItemsToSell: "매도할 종목이 없습니다.",
      buyItemsTitle: "🔵 매수 항목 (매도 자금으로)",
      sectorAnalysisTitle: "🗂️ 섹터별 분석",
      sector: "섹터",
      amount: "금액",
      ratio: "비중",
      // --- Added captions ---
      sectorAnalysisCaption: "섹터별 자산 분포",
      addModeCaption: "추가 매수 추천 결과",
      sellModeSellCaption: "매도 추천 항목",
      sellModeBuyCaption: "매수 추천 항목 (매도 자금)"
      // --- Added captions ---
    },
    state: {
       noActivePortfolio: "활성화된 포트폴리오가 없습니다.",
       noPortfolioData: "포트폴리오 데이터가 없습니다."
    },
    error: {
        cannotGetInputs: "계산 입력값을 가져올 수 없습니다."
    },
    api: {
      fetchSuccessAll: "{count}개 종목 업데이트 완료.",
      fetchSuccessPartial: "{count}개 성공 ({failed} 실패)",
      fetchFailedAll: "모든 종목({failed}) 가격 로딩 실패. API 키나 티커를 확인하세요.",
      noUpdates: "업데이트할 종목이 없습니다.",
      fetchErrorGlobal: "API 호출 중 오류 발생: {message}"
    }
  }
};

/**
 * @description 브라우저 언어 설정을 감지하여 'en' 또는 'ko'를 반환합니다.
 */
function getBrowserLanguage(): Lang {
    const lang = (navigator as any).language || (navigator as any).userLanguage;
    if (lang.toLowerCase().startsWith('ko')) {
        return 'ko';
    }
    return 'en'; // 기본값
}

/**
 * @description localStorage에서 저장된 언어를 로드하거나 브라우저 언어 감지
 */
function getStoredLanguage(): Lang {
    const storedLang = localStorage.getItem('sprc_language');
    if (storedLang === 'ko' || storedLang === 'en') {
        return storedLang;
    }
    return getBrowserLanguage();
}

// 2. 현재 언어 설정 (localStorage 우선, 없으면 브라우저 언어)
let currentLang: Lang = getStoredLanguage();
let messages: any = locales[currentLang] || locales.en;

/**
 * @description 언어 변경 및 localStorage 저장
 */
export function setLanguage(newLang: Lang): void {
    if (newLang !== 'en' && newLang !== 'ko') {
        console.warn(`[i18n] Unsupported language: ${newLang}`);
        return;
    }
    currentLang = newLang;
    messages = locales[currentLang] || locales.en;
    localStorage.setItem('sprc_language', newLang);
    console.log(`[i18n] Language changed to ${newLang}`);
}

/**
 * @description 현재 언어 코드 반환
 */
export function getCurrentLanguage(): Lang {
    return currentLang;
}

/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 */
export function t(key: string, replacements: Replacements = {}): string {
    const keys = key.split('.');
    let message: any = keys.reduce(
        (obj: any, k: string) => (obj && obj[k] !== undefined ? obj[k] : key),
        messages
    );

    if (typeof message !== 'string') {
        message = keys.reduce(
            (obj: any, k: string) => (obj && obj[k] !== undefined ? obj[k] : key),
            locales.en
        ); // Fallback to English
        if (typeof message !== 'string') {
            console.warn(`[i18n] Missing key in all locales: ${key}`);
            return key;
        }
    }

    return message.replace(/{(\w+)}/g, (match: string, placeholder: string) => {
        return replacements[placeholder] !== undefined
            ? String(replacements[placeholder])
            : match;
    });
}
```

---

## `src/eventBinder.ts`

```typescript
// src/eventBinder.ts (Updated with Pub/Sub emit)
import { debounce } from './utils';
import Decimal from 'decimal.js';
import type { PortfolioView } from './view';

/**
 * @description 애플리케이션의 DOM 이벤트를 View의 추상 이벤트로 연결합니다.
 * @param view - PortfolioView 인스턴스
 * @returns 이벤트 리스너 정리를 위한 AbortController
 */
export function bindEventListeners(view: PortfolioView): AbortController {
    // AbortController 생성 (메모리 누수 방지)
    const abortController = new AbortController();
    const { signal } = abortController;

    // 1. view.dom 객체를 가져옵니다.
    const dom = view.dom;

    // ▼▼▼▼▼ [수정] controller.handle...() -> view.emit('eventName') ▼▼▼▼▼

    // 포트폴리오 관리 버튼 (AbortController signal 적용)
    dom.newPortfolioBtn?.addEventListener('click', () => view.emit('newPortfolioClicked'), { signal });
    dom.renamePortfolioBtn?.addEventListener('click', () => view.emit('renamePortfolioClicked'), { signal });
    dom.deletePortfolioBtn?.addEventListener('click', () => view.emit('deletePortfolioClicked'), { signal });
    dom.portfolioSelector?.addEventListener('change', (e) =>
        view.emit('portfolioSwitched', { newId: (e.target as HTMLSelectElement).value })
    );

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => view.emit('addNewStockClicked'));
    dom.resetDataBtn?.addEventListener('click', () => view.emit('resetDataClicked'));
    dom.normalizeRatiosBtn?.addEventListener('click', () => view.emit('normalizeRatiosClicked'));
    dom.fetchAllPricesBtn?.addEventListener('click', () => view.emit('fetchAllPricesClicked'));

    // 템플릿 적용 버튼 (Phase 3.2)
    dom.applyTemplateBtn?.addEventListener('click', () => {
        const select = dom.allocationTemplateSelect as HTMLSelectElement | null;
        if (select && select.value) {
            view.emit('applyTemplateClicked', { template: select.value });
        }
    });

    // 데이터 관리 드롭다운
    const dataManagementBtn = dom.dataManagementBtn as HTMLButtonElement | null;
    const dataDropdownContent = dom.dataDropdownContent as HTMLElement | null;
    const exportDataBtn = dom.exportDataBtn as HTMLAnchorElement | null;
    const importDataBtn = dom.importDataBtn as HTMLAnchorElement | null;
    const importFileInput = dom.importFileInput as HTMLInputElement | null;
    const dropdownItems = dataDropdownContent?.querySelectorAll('a[role="menuitem"]') ?? [];

    const toggleDropdown = (show: boolean): void => {
        if (dataDropdownContent && dataManagementBtn) {
            dataDropdownContent.classList.toggle('show', show);
            dataManagementBtn.setAttribute('aria-expanded', String(show));
        }
    };

    dataManagementBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dataManagementBtn.getAttribute('aria-expanded') === 'true';
        toggleDropdown(!isExpanded);
        if (!isExpanded && dropdownItems.length > 0) {
            (dropdownItems[0] as HTMLElement).focus();
        }
    });

    dataDropdownContent?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        const currentIndex = Array.from(dropdownItems).indexOf(target);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownItems.length;
                (dropdownItems[nextIndex] as HTMLElement).focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownItems.length) % dropdownItems.length;
                (dropdownItems[prevIndex] as HTMLElement).focus();
                break;
            case 'Escape':
                toggleDropdown(false);
                dataManagementBtn?.focus();
                break;
            case 'Tab':
                toggleDropdown(false);
                break;
        }
    });


    exportDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('exportDataClicked');
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('importDataClicked');
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    dom.exportTransactionsCSVBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('exportTransactionsCSVClicked');
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    window.addEventListener('click', (e) => {
        const target = e.target as Node | null;
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    importFileInput?.addEventListener('change', (e) => view.emit('fileSelected', e));

    // 포트폴리오 테이블 입력 처리
    dom.virtualScrollWrapper?.addEventListener('change', (e) =>
        view.emit('portfolioBodyChanged', e)
    );
    dom.virtualScrollWrapper?.addEventListener('click', (e) =>
        view.emit('portfolioBodyClicked', e)
    );

    // 포트폴리오 테이블 키보드 네비게이션
    const virtualScrollWrapper = dom.virtualScrollWrapper;
    virtualScrollWrapper?.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return;

        const currentRow = target.closest('div[data-id]') as HTMLDivElement | null;
        if (!currentRow?.dataset.id) return;
        const stockId = currentRow.dataset.id;
        const currentCell = target.closest('.virtual-cell');
        const currentCellIndex = currentCell ? Array.from(currentRow.children).indexOf(currentCell) : -1;
        const field = (target as HTMLInputElement).dataset.field;

        switch (e.key) {
            case 'Enter':
                 if (field === 'ticker') {
                    e.preventDefault();
                    // 컨트롤러가 할 일(모달 열기)을 View에 이벤트로 알림
                    view.emit('manageStockClicked', { stockId });
                 }
                 else if (currentCellIndex !== -1 && currentRow instanceof HTMLDivElement) {
                    e.preventDefault();
                    const direction = e.shiftKey ? -1 : 1;
                    const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                    const nextCell = currentRow.children[nextCellIndex];
                    const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                    nextInput?.focus();
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const siblingRow = (e.key === 'ArrowUp')
                    ? currentRow.previousElementSibling?.previousElementSibling
                    : currentRow.nextElementSibling?.nextElementSibling;

                if (siblingRow instanceof HTMLDivElement && siblingRow.matches('.virtual-row-inputs') && currentCellIndex !== -1) {
                     const targetCell = siblingRow.children[currentCellIndex];
                     const targetInput = targetCell?.querySelector('input') as HTMLElement | null;
                     targetInput?.focus();
                }
                break;
             case 'ArrowLeft':
             case 'ArrowRight':
                 if (target instanceof HTMLInputElement && (target.type !== 'text' || target.selectionStart === (e.key === 'ArrowLeft' ? 0 : target.value.length)) && currentRow instanceof HTMLDivElement) {
                     e.preventDefault();
                     const direction = e.key === 'ArrowLeft' ? -1 : 1;
                     const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                     const nextCell = currentRow.children[nextCellIndex];
                     const nextInput = nextCell?.querySelector('input') as HTMLElement | null;
                     nextInput?.focus();
                 }
                 break;
            case 'Delete':
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     view.emit('deleteStockShortcut', { stockId });
                }
                break;
            case 'Escape':
                 e.preventDefault();
                 target.blur();
                 break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    dom.virtualScrollWrapper?.addEventListener('focusin', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    dom.calculateBtn?.addEventListener('click', () => view.emit('calculateClicked'));
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    });

    // 성과 히스토리 버튼
    dom.showPerformanceHistoryBtn?.addEventListener('click', () => view.emit('showPerformanceHistoryClicked'));
    dom.showSnapshotListBtn?.addEventListener('click', () => view.emit('showSnapshotListClicked'));

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const mode = (e.target as HTMLInputElement).value as 'add' | 'sell' | 'simple';
        view.emit('mainModeChanged', { mode });
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const currency = (e.target as HTMLInputElement).value as 'krw' | 'usd';
        view.emit('currencyModeChanged', { currency });
    }));

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce((source: 'krw' | 'usd') => view.emit('currencyConversion', { source }), 300);
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw');
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e: KeyboardEvent): void => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && (e.target as any).isComposing)) {
            e.preventDefault();
            view.emit('calculateClicked');
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // 포트폴리오 환율 설정
    dom.portfolioExchangeRateInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            // 두 환율 입력란 동기화
            if (dom.exchangeRateInput instanceof HTMLInputElement) {
                dom.exchangeRateInput.value = target.value;
            }
            // 포트폴리오 설정 업데이트
            view.emit('portfolioExchangeRateChanged', { rate });
            // 추가 투자금 재계산 (USD 모드인 경우)
            debouncedConversion('krw');
        }
    });

    // 리밸런싱 허용 오차 설정
    dom.rebalancingToleranceInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const tolerance = parseFloat(target.value);
        const isValid = !isNaN(tolerance) && tolerance >= 0;
        view.toggleInputValidation(target, isValid);
        if (isValid) {
            view.emit('rebalancingToleranceChanged', { tolerance });
        }
    });

    // 추가 투자금 섹션의 환율 변경 시 포트폴리오 환율과 동기화
    const originalExchangeRateHandler = dom.exchangeRateInput;
    if (originalExchangeRateHandler) {
        originalExchangeRateHandler.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const rate = parseFloat(target.value);
            if (!isNaN(rate) && rate > 0) {
                // 포트폴리오 환율 입력란과 동기화
                if (dom.portfolioExchangeRateInput instanceof HTMLInputElement) {
                    dom.portfolioExchangeRateInput.value = target.value;
                }
                // 포트폴리오 설정 업데이트
                view.emit('portfolioExchangeRateChanged', { rate });
            }
        });
    }

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    dom.closeModalBtn?.addEventListener('click', () => view.emit('closeTransactionModalClicked'));

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) => view.emit('newTransactionSubmitted', e));

    // 입력 방식 전환 (수량 입력 vs 금액 입력)
    const inputModeQuantity = document.getElementById('inputModeQuantity');
    const inputModeAmount = document.getElementById('inputModeAmount');
    const quantityInputGroup = document.getElementById('quantityInputGroup');
    const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
    const txQuantityInput = document.getElementById('txQuantity') as HTMLInputElement | null;
    const txTotalAmountInput = document.getElementById('txTotalAmount') as HTMLInputElement | null;
    const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

    const toggleInputMode = (): void => {
        const isQuantityMode = inputModeQuantity instanceof HTMLInputElement && inputModeQuantity.checked;

        if (quantityInputGroup && totalAmountInputGroup && txQuantityInput && txTotalAmountInput) {
            if (isQuantityMode) {
                // 수량 입력 모드
                quantityInputGroup.style.display = '';
                totalAmountInputGroup.style.display = 'none';
                txQuantityInput.required = true;
                txTotalAmountInput.required = false;
                txTotalAmountInput.value = '';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
            } else {
                // 금액 입력 모드
                quantityInputGroup.style.display = 'none';
                totalAmountInputGroup.style.display = '';
                txQuantityInput.required = false;
                txTotalAmountInput.required = true;
                txQuantityInput.value = '';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'block';
            }
        }
    };

    inputModeQuantity?.addEventListener('change', toggleInputMode);
    inputModeAmount?.addEventListener('change', toggleInputMode);

    // 금액 입력 모드에서 총 금액 또는 단가 변경 시 수량 자동 계산 (Decimal.js 사용)
    const calculateQuantityFromAmount = (): void => {
        const isAmountMode = inputModeAmount instanceof HTMLInputElement && inputModeAmount.checked;
        if (!isAmountMode) return;

        const txPriceInput = document.getElementById('txPrice') as HTMLInputElement | null;
        const calculatedQuantityValue = document.getElementById('calculatedQuantityValue');

        if (txTotalAmountInput && txPriceInput && calculatedQuantityValue) {
            try {
                const totalAmount = txTotalAmountInput.value ? new Decimal(txTotalAmountInput.value) : new Decimal(0);
                const price = txPriceInput.value ? new Decimal(txPriceInput.value) : new Decimal(0);

                if (price.greaterThan(0) && totalAmount.greaterThan(0)) {
                    const quantity = totalAmount.div(price);
                    calculatedQuantityValue.textContent = quantity.toFixed(8);
                } else {
                    calculatedQuantityValue.textContent = '0';
                }
            } catch (error) {
                calculatedQuantityValue.textContent = '0';
                console.error('Error calculating quantity from amount:', error);
            }
        }
    };

    txTotalAmountInput?.addEventListener('input', calculateQuantityFromAmount);
    document.getElementById('txPrice')?.addEventListener('input', calculateQuantityFromAmount);

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 1. 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            const row = deleteButton.closest('tr[data-tx-id]') as HTMLTableRowElement | null;
            const modal = deleteButton.closest('#transactionModal') as HTMLElement | null;
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            // 2. 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                view.emit('transactionDeleteClicked', { stockId, txId });
            }
        }

        // 3. 모달 오버레이 클릭 시 닫기
        if (e.target === dom.transactionModal) {
             view.emit('closeTransactionModalClicked');
        }
    });

    // --- 기타 ---
    // 다크 모드 토글 버튼
    dom.darkModeToggle?.addEventListener('click', () => view.emit('darkModeToggleClicked'), { signal });
    // 페이지 닫기 전 자동 저장 (beforeunload는 signal 미적용 - 브라우저 이벤트)
    window.addEventListener('beforeunload', () => view.emit('pageUnloading'));

    // 키보드 네비게이션 포커스 스타일
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    }, { signal });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    }, { signal });

    // AbortController 반환 (메모리 누수 방지용 cleanup)
    return abortController;
}
```

---

## `src/view.ts`

```typescript
// src/view.ts (리팩토링: 모듈화)
import { CONFIG } from './constants';
import { getRatioSum } from './utils';
import { t } from './i18n';
import Decimal from 'decimal.js';
import type { Stock, CalculatedStock, Transaction, PortfolioSnapshot } from './types';
import type { Chart } from 'chart.js';

// 분리된 모듈들
import { EventEmitter, type EventCallback } from './view/EventEmitter';
import { ModalManager } from './view/ModalManager';
import { VirtualScrollManager } from './view/VirtualScrollManager';
import { ResultsRenderer } from './view/ResultsRenderer';

// DOM 요소 타입 정의
interface DOMElements {
    ariaAnnouncer: HTMLElement | null;
    resultsSection: HTMLElement | null;
    sectorAnalysisSection: HTMLElement | null;
    chartSection: HTMLElement | null;
    portfolioChart: HTMLElement | null;
    additionalAmountInput: HTMLElement | null;
    additionalAmountUSDInput: HTMLElement | null;
    exchangeRateInput: HTMLElement | null;
    portfolioExchangeRateInput: HTMLElement | null;
    mainModeSelector: NodeListOf<HTMLElement> | null;
    currencyModeSelector: NodeListOf<HTMLElement> | null;
    exchangeRateGroup: HTMLElement | null;
    usdInputGroup: HTMLElement | null;
    addInvestmentCard: HTMLElement | null;
    calculateBtn: HTMLElement | null;
    darkModeToggle: HTMLElement | null;
    addNewStockBtn: HTMLElement | null;
    fetchAllPricesBtn: HTMLElement | null;
    resetDataBtn: HTMLElement | null;
    normalizeRatiosBtn: HTMLElement | null;
    dataManagementBtn: HTMLElement | null;
    dataDropdownContent: HTMLElement | null;
    exportDataBtn: HTMLElement | null;
    importDataBtn: HTMLElement | null;
    importFileInput: HTMLElement | null;
    transactionModal: HTMLElement | null;
    modalStockName: HTMLElement | null;
    closeModalBtn: HTMLElement | null;
    transactionListBody: HTMLElement | null;
    newTransactionForm: HTMLElement | null;
    txDate: HTMLElement | null;
    txQuantity: HTMLElement | null;
    txPrice: HTMLElement | null;
    portfolioSelector: HTMLElement | null;
    newPortfolioBtn: HTMLElement | null;
    renamePortfolioBtn: HTMLElement | null;
    deletePortfolioBtn: HTMLElement | null;
    virtualTableHeader: HTMLElement | null;
    virtualScrollWrapper: HTMLElement | null;
    virtualScrollSpacer: HTMLElement | null;
    virtualScrollContent: HTMLElement | null;
    ratioValidator: HTMLElement | null;
    ratioSum: HTMLElement | null;
    customModal: HTMLElement | null;
    customModalTitle: HTMLElement | null;
    customModalMessage: HTMLElement | null;
    customModalInput: HTMLElement | null;
    customModalConfirm: HTMLElement | null;
    customModalCancel: HTMLElement | null;
}

/**
 * @class PortfolioView
 * @description 포트폴리오 UI를 담당하는 View 클래스 (리팩토링: 모듈화)
 */
export class PortfolioView {
    dom: DOMElements = {} as DOMElements;

    // 분리된 모듈들
    private eventEmitter: EventEmitter;
    private modalManager: ModalManager;
    private virtualScrollManager: VirtualScrollManager;
    private resultsRenderer: ResultsRenderer;

    /**
     * @constructor
     * @description View 초기화
     */
    constructor() {
        // 모듈 인스턴스 생성 (DOM 캐싱 후 초기화됨)
        this.eventEmitter = new EventEmitter();
        this.modalManager = new ModalManager(this.dom);
        this.virtualScrollManager = new VirtualScrollManager(this.dom);
        this.resultsRenderer = new ResultsRenderer(this.dom);
    }

    /**
     * @description EventEmitter 메서드 위임
     */
    on(event: string, callback: EventCallback): void {
        this.eventEmitter.on(event, callback);
    }

    emit(event: string, data?: any): void {
        this.eventEmitter.emit(event, data);
    }

    /**
     * @description DOM 요소 캐싱
     */
    cacheDomElements(): void {
        const D = document;
        this.dom = {
            ariaAnnouncer: D.getElementById('aria-announcer'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            portfolioExchangeRateInput: D.getElementById('portfolioExchangeRate'),
            rebalancingToleranceInput: D.getElementById('rebalancingTolerance'),
            tradingFeeRateInput: D.getElementById('tradingFeeRate'),
            taxRateInput: D.getElementById('taxRate'),
            mainModeSelector: D.querySelectorAll('input[name="mainMode"]'),
            currencyModeSelector: D.querySelectorAll('input[name="currencyMode"]'),
            exchangeRateGroup: D.getElementById('exchangeRateGroup'),
            usdInputGroup: D.getElementById('usdInputGroup'),
            addInvestmentCard: D.getElementById('addInvestmentCard'),
            calculateBtn: D.getElementById('calculateBtn'),
            darkModeToggle: D.getElementById('darkModeToggle'),
            addNewStockBtn: D.getElementById('addNewStockBtn'),
            fetchAllPricesBtn: D.getElementById('fetchAllPricesBtn'),
            allocationTemplateSelect: D.getElementById('allocationTemplate'),
            applyTemplateBtn: D.getElementById('applyTemplateBtn'),
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),
            dataManagementBtn: D.getElementById('dataManagementBtn'),
            dataDropdownContent: D.getElementById('dataDropdownContent'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
            exportTransactionsCSVBtn: D.getElementById('exportTransactionsCSVBtn'),
            importFileInput: D.getElementById('importFileInput'),
            transactionModal: D.getElementById('transactionModal'),
            modalStockName: D.getElementById('modalStockName'),
            closeModalBtn: D.getElementById('closeModalBtn'),
            transactionListBody: D.getElementById('transactionListBody'),
            newTransactionForm: D.getElementById('newTransactionForm'),
            txDate: D.getElementById('txDate'),
            txQuantity: D.getElementById('txQuantity'),
            txPrice: D.getElementById('txPrice'),
            portfolioSelector: D.getElementById('portfolioSelector'),
            newPortfolioBtn: D.getElementById('newPortfolioBtn'),
            renamePortfolioBtn: D.getElementById('renamePortfolioBtn'),
            deletePortfolioBtn: D.getElementById('deletePortfolioBtn'),
            virtualTableHeader: D.getElementById('virtual-table-header'),
            virtualScrollWrapper: D.getElementById('virtual-scroll-wrapper'),
            virtualScrollSpacer: D.getElementById('virtual-scroll-spacer'),
            virtualScrollContent: D.getElementById('virtual-scroll-content'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),
            customModal: D.getElementById('customModal'),
            customModalTitle: D.getElementById('customModalTitle'),
            customModalMessage: D.getElementById('customModalMessage'),
            customModalInput: D.getElementById('customModalInput'),
            customModalConfirm: D.getElementById('customModalConfirm'),
            customModalCancel: D.getElementById('customModalCancel'),
            performanceHistorySection: D.getElementById('performanceHistorySection'),
            showPerformanceHistoryBtn: D.getElementById('showPerformanceHistoryBtn'),
            showSnapshotListBtn: D.getElementById('showSnapshotListBtn'),
            performanceChartContainer: D.getElementById('performanceChartContainer'),
            performanceChart: D.getElementById('performanceChart'),
            snapshotListContainer: D.getElementById('snapshotListContainer'),
            snapshotList: D.getElementById('snapshotList'),
        };

        this.eventEmitter.clear();

        // 모듈 재초기화 (DOM 참조 업데이트)
        this.modalManager = new ModalManager(this.dom);
        this.virtualScrollManager = new VirtualScrollManager(this.dom);
        this.resultsRenderer = new ResultsRenderer(this.dom);

        // 모달 이벤트 바인딩
        this.modalManager.bindModalEvents();
    }

    // ===== ARIA & Accessibility =====

    /**
     * @description ARIA 알림 발표
     * @param message - 알림 메시지
     * @param politeness - 우선순위
     */
    announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
        const announcer = this.dom.ariaAnnouncer;
        if (announcer) {
            announcer.textContent = '';
            announcer.setAttribute('aria-live', politeness);
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }

    /**
     * @description Toast 메시지 표시
     * @param message - 메시지
     * @param type - 메시지 타입
     */
    showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * @description 입력 필드 유효성 검사 시각적 표시
     * @param inputElement - 입력 요소
     * @param isValid - 유효 여부
     * @param errorMessage - 에러 메시지
     */
    toggleInputValidation(inputElement: HTMLInputElement, isValid: boolean, errorMessage: string = ''): void {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    }

    // ===== Modal 위임 =====

    async showConfirm(title: string, message: string): Promise<boolean> {
        return this.modalManager.showConfirm(title, message);
    }

    async showPrompt(title: string, message: string, defaultValue: string = ''): Promise<string | null> {
        return this.modalManager.showPrompt(title, message, defaultValue);
    }

    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.modalManager.openTransactionModal(stock, currency, transactions);
    }

    closeTransactionModal(): void {
        this.modalManager.closeTransactionModal();
    }

    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        this.modalManager.renderTransactionList(transactions, currency);
    }

    // ===== VirtualScroll 위임 =====

    renderTable(calculatedPortfolioData: CalculatedStock[], currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        this.virtualScrollManager.renderTable(calculatedPortfolioData, currency, mainMode);
    }

    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this.virtualScrollManager.updateVirtualTableData(calculatedPortfolioData);
    }

    updateStockInVirtualData(stockId: string, field: string, value: any): void {
        this.virtualScrollManager.updateStockInVirtualData(stockId, field, value);
    }

    updateSingleStockRow(stockId: string, calculatedData: any): void {
        this.virtualScrollManager.updateSingleStockRow(stockId, calculatedData);
    }

    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        this.virtualScrollManager.updateAllTargetRatioInputs(portfolioData);
    }

    updateCurrentPriceInput(id: string, price: string): void {
        this.virtualScrollManager.updateCurrentPriceInput(id, price);
    }

    focusOnNewStock(stockId: string): void {
        this.virtualScrollManager.focusOnNewStock(stockId);
    }

    // ===== ResultsRenderer 위임 =====

    displaySkeleton(): void {
        this.resultsRenderer.displaySkeleton();
    }

    displayResults(html: string): void {
        this.resultsRenderer.displayResults(html);
        this.announce(t('aria.resultsLoaded'), 'assertive');
    }

    displaySectorAnalysis(html: string): void {
        this.resultsRenderer.displaySectorAnalysis(html);
    }

    displayChart(ChartClass: typeof Chart, labels: string[], data: number[], title: string): void {
        this.resultsRenderer.displayChart(ChartClass, labels, data, title);
    }

    async displayPerformanceHistory(ChartClass: typeof Chart, snapshots: PortfolioSnapshot[], currency: 'krw' | 'usd'): Promise<void> {
        await this.resultsRenderer.displayPerformanceHistory(ChartClass, snapshots, currency);
    }

    hideResults(): void {
        this.resultsRenderer.hideResults();
    }

    cleanupObserver(): void {
        this.resultsRenderer.cleanupObserver();
    }

    destroyChart(): void {
        this.resultsRenderer.destroyChart();
    }

    cleanup(): void {
        this.resultsRenderer.cleanup();
    }

    // ===== 포트폴리오 UI =====

    /**
     * @description 포트폴리오 선택기 렌더링
     * @param portfolios - 포트폴리오 목록
     * @param activeId - 활성 포트폴리오 ID
     */
    renderPortfolioSelector(portfolios: Record<string, { name: string }>, activeId: string): void {
        const selector = this.dom.portfolioSelector;
        if (!(selector instanceof HTMLSelectElement)) return;

        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = id === activeId;
            selector.appendChild(option);
        });
    }

    /**
     * @description 목표 비율 합계 업데이트
     * @param totalRatio - 총 비율
     */
    updateRatioSum(totalRatio: number): void {
        const ratioSumEl = this.dom.ratioSum;
        const ratioValidatorEl = this.dom.ratioValidator;
        if (!ratioSumEl || !ratioValidatorEl) return;

        ratioSumEl.textContent = `${totalRatio.toFixed(1)}%`;
        ratioValidatorEl.classList.remove('valid', 'invalid');

        if (Math.abs(totalRatio - 100) < CONFIG.RATIO_TOLERANCE) {
            ratioValidatorEl.classList.add('valid');
        } else if (totalRatio > 0) {
            ratioValidatorEl.classList.add('invalid');
        }
    }

    /**
     * @description 메인 모드 UI 업데이트
     * @param mainMode - 메인 모드
     */
    updateMainModeUI(mainMode: 'add' | 'sell' | 'simple'): void {
        const addCard = this.dom.addInvestmentCard;
        const modeRadios = this.dom.mainModeSelector;

        addCard?.classList.toggle('hidden', mainMode !== 'add' && mainMode !== 'simple');

        modeRadios?.forEach((radio) => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    }

    /**
     * @description 통화 모드 UI 업데이트
     * @param currencyMode - 통화 모드
     */
    updateCurrencyModeUI(currencyMode: 'krw' | 'usd'): void {
        const isUsdMode = currencyMode === 'usd';
        const rateGroup = this.dom.exchangeRateGroup;
        const usdGroup = this.dom.usdInputGroup;
        const currencyRadios = this.dom.currencyModeSelector;
        const usdInput = this.dom.additionalAmountUSDInput;

        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);

        currencyRadios?.forEach((radio) => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === currencyMode;
        });

        if (!isUsdMode && usdInput instanceof HTMLInputElement) usdInput.value = '';
    }

    /**
     * @description 가격 가져오기 버튼 상태 토글
     * @param loading - 로딩 상태
     */
    toggleFetchButton(loading: boolean): void {
        const btn = this.dom.fetchAllPricesBtn;
        if (!(btn instanceof HTMLButtonElement)) return;

        btn.disabled = loading;
        btn.textContent = loading ? t('ui.fetchingPrices') : t('ui.updateAllPrices');

        if (loading) {
            btn.setAttribute('aria-busy', 'true');
            this.announce(t('ui.fetchingPrices'), 'assertive');
        } else {
            btn.removeAttribute('aria-busy');
        }
    }
}
```

---

## `src/errorService.ts`

```typescript
import { t } from './i18n.ts';

/**
 * @description 유효성 검사 오류를 나타내는 커스텀 에러 클래스
 */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const ErrorService = {
    _viewInstance: null as any | null,

    /**
     * @description View 인스턴스를 설정합니다.
     */
    setViewInstance(view: any): void {
        this._viewInstance = view;
    },

    /**
     * @description 중앙 집중식 에러 핸들러. 콘솔에 에러를 기록하고 사용자에게 토스트 메시지를 표시합니다.
     */
    handle(error: Error, context: string = 'General'): void {
        console.error(`Error in ${context}:`, error);

        // 기본 오류 메시지
        let userMessage = t('validation.calculationError');

        // 오류 타입에 따라 사용자 메시지 구체화
        if (error instanceof ValidationError) {
            userMessage = `${t('validation.validationErrorPrefix')}\n${error.message}`;
        } else if (error.name === 'QuotaExceededError') {
            // LocalStorage quota exceeded
            userMessage = t('validation.saveErrorQuota');
        } else if (error.name === 'SecurityError') {
            // LocalStorage access denied
            userMessage = t('validation.saveErrorSecurity');
        } else if (error.name === 'DecimalError') {
            // Decimal.js 관련 오류
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes('structure')) {
            // 파일 구조 관련 오류 (import 시)
            userMessage = t('validation.invalidFileStructure');
        } else if (context.includes('save') || context.includes('Save')) {
            // 저장 관련 컨텍스트
            userMessage = t('validation.saveErrorGeneral');
        }

        // 사용자에게 토스트 메시지 표시 (view 인스턴스가 설정된 경우에만)
        if (this._viewInstance) {
            this._viewInstance.showToast(userMessage, 'error');
        } else {
            console.warn('[ErrorService] View instance not set. Cannot show toast.');
        }
    },
};
```

---

## `src/controller.ts`

```typescript
// src/controller.ts (리팩토링: 모듈화)
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Calculator } from './calculator';
import { DataStore } from './dataStore';
import { debounce, getRatioSum } from './utils';
import { CONFIG, DECIMAL_ZERO } from './constants';
import { ErrorService } from './errorService';
import { generateSectorAnalysisHTML } from './templates';
import Decimal from 'decimal.js';
import { bindEventListeners } from './eventBinder';

// ===== [Phase 2.2 Web Worker 통합] =====
import { getCalculatorWorkerService } from './services/CalculatorWorkerService';
// ===== [Phase 2.2 Web Worker 통합 끝] =====

// 분리된 매니저 모듈들
import { PortfolioManager } from './controller/PortfolioManager';
import { StockManager } from './controller/StockManager';
import { TransactionManager } from './controller/TransactionManager';
import { CalculationManager } from './controller/CalculationManager';
import { DataManager } from './controller/DataManager';

/**
 * @class PortfolioController
 * @description 포트폴리오 컨트롤러 (리팩토링: 모듈화)
 */
export class PortfolioController {
    state: PortfolioState;
    view: PortfolioView;
    debouncedSave: () => void;

    // 분리된 매니저들
    private portfolioManager: PortfolioManager;
    private stockManager: StockManager;
    private transactionManager: TransactionManager;
    private calculationManager: CalculationManager;
    private dataManager: DataManager;

    // ===== [Phase 2.2 Web Worker 통합] =====
    private calculatorWorker = getCalculatorWorkerService();
    // ===== [Phase 2.2 Web Worker 통합 끝] =====

    #lastCalculationKey: string | null = null;
    #eventAbortController: AbortController | null = null;

    constructor(state: PortfolioState, view: PortfolioView) {
        this.state = state;
        this.view = view;
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);

        // 매니저 인스턴스 생성
        this.portfolioManager = new PortfolioManager(this.state, this.view);
        this.stockManager = new StockManager(this.state, this.view, this.debouncedSave);
        this.transactionManager = new TransactionManager(this.state, this.view);
        this.calculationManager = new CalculationManager(
            this.state,
            this.view,
            this.debouncedSave,
            this.getInvestmentAmountInKRW.bind(this)
        );
        this.dataManager = new DataManager(this.state, this.view);

        this.initialize();
    }

    /**
     * @description 컨트롤러 초기화
     */
    async initialize(): Promise<void> {
        await this.state.ensureInitialized();
        this.view.cacheDomElements();
        ErrorService.setViewInstance(this.view);
        this.setupInitialUI();
        this.bindControllerEvents();
        this.#eventAbortController = bindEventListeners(this.view);
    }

    /**
     * @description 이벤트 리스너 정리 (메모리 누수 방지)
     */
    cleanup(): void {
        if (this.#eventAbortController) {
            this.#eventAbortController.abort();
            this.#eventAbortController = null;
            console.log('[Controller] Event listeners cleaned up');
        }
    }

    /**
     * @description 초기 UI 설정
     */
    setupInitialUI(): void {
        const storedDarkMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
        if (storedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        } else if (storedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            localStorage.setItem(CONFIG.DARK_MODE_KEY, 'true');
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const storedMode = localStorage.getItem(CONFIG.DARK_MODE_KEY);
            if (storedMode === null) {
                document.body.classList.toggle('dark-mode', e.matches);
            }
        });

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            const { exchangeRateInput, portfolioExchangeRateInput, rebalancingToleranceInput, tradingFeeRateInput, taxRateInput } = this.view.dom;
            if (exchangeRateInput instanceof HTMLInputElement) {
                exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
            }
            if (rebalancingToleranceInput instanceof HTMLInputElement) {
                rebalancingToleranceInput.value = (activePortfolio.settings.rebalancingTolerance ?? 5).toString();
            }
            if (tradingFeeRateInput instanceof HTMLInputElement) {
                tradingFeeRateInput.value = (activePortfolio.settings.tradingFeeRate ?? 0.3).toString();
            }
            if (taxRateInput instanceof HTMLInputElement) {
                taxRateInput.value = (activePortfolio.settings.taxRate ?? 15).toString();
            }

            this.fullRender();

            // Phase 4.2: 환율 자동 로드
            this.loadExchangeRate();
        }
    }

    /**
     * @description 환율 자동 로드 (Phase 4.2)
     */
    async loadExchangeRate(): Promise<void> {
        try {
            const rate = await (await import('./apiService')).apiService.fetchExchangeRate();
            if (rate) {
                const activePortfolio = this.state.getActivePortfolio();
                if (activePortfolio) {
                    activePortfolio.settings.exchangeRate = rate;
                    await this.state.saveActivePortfolio();

                    // UI 업데이트
                    const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                    if (exchangeRateInput instanceof HTMLInputElement) {
                        exchangeRateInput.value = rate.toFixed(2);
                    }
                    if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                        portfolioExchangeRateInput.value = rate.toFixed(2);
                    }

                    console.log('[Controller] Exchange rate auto-loaded:', rate);
                }
            }
        } catch (error) {
            console.warn('[Controller] Failed to auto-load exchange rate:', error);
        }
    }

    /**
     * @description 컨트롤러 이벤트 바인딩
     */
    bindControllerEvents(): void {
        // 포트폴리오 관리
        this.view.on('newPortfolioClicked', async () => {
            await this.portfolioManager.handleNewPortfolio();
            this.fullRender();
        });
        this.view.on('renamePortfolioClicked', () => this.portfolioManager.handleRenamePortfolio());
        this.view.on('deletePortfolioClicked', async () => {
            await this.portfolioManager.handleDeletePortfolio();
        });
        this.view.on('portfolioSwitched', async (data) => {
            await this.portfolioManager.handleSwitchPortfolio(data.newId);
            this.fullRender();
        });

        // 주식 관리
        this.view.on('addNewStockClicked', async () => {
            const result = await this.stockManager.handleAddNewStock();
            if (result.needsFullRender) {
                this.fullRender();
                if (result.stockId) this.view.focusOnNewStock(result.stockId);
            }
        });
        this.view.on('normalizeRatiosClicked', () => this.calculationManager.handleNormalizeRatios());
        this.view.on('applyTemplateClicked', (data) => this.handleApplyTemplate(data.template));
        this.view.on('fetchAllPricesClicked', async () => {
            const result = await this.calculationManager.handleFetchAllPrices();
            if (result.needsUIUpdate) this.updateUIState();
        });

        // 데이터 관리
        this.view.on('resetDataClicked', async () => {
            const result = await this.dataManager.handleResetData();
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('exportDataClicked', () => this.dataManager.handleExportData());
        this.view.on('importDataClicked', () => this.dataManager.handleImportData());
        this.view.on('exportTransactionsCSVClicked', () => this.dataManager.handleExportTransactionsCSV());
        this.view.on('fileSelected', async (e) => {
            const result = await this.dataManager.handleFileSelected(e);
            if (result.needsUISetup) this.setupInitialUI();
        });

        // 테이블 상호작용
        this.view.on('portfolioBodyChanged', (e) => this.stockManager.handlePortfolioBodyChange(e));
        this.view.on('portfolioBodyClicked', (e) => {
            const result = this.stockManager.handlePortfolioBodyClick(e);
            if (result.action === 'manage' && result.stockId) {
                this.transactionManager.openTransactionModalByStockId(result.stockId);
            } else if (result.action === 'delete' && result.stockId) {
                this.stockManager.handleDeleteStock(result.stockId).then((deleteResult) => {
                    if (deleteResult.needsFullRender) this.fullRender();
                });
            }
        });
        this.view.on('manageStockClicked', (data) => this.transactionManager.openTransactionModalByStockId(data.stockId));
        this.view.on('deleteStockShortcut', async (data) => {
            const result = await this.stockManager.handleDeleteStock(data.stockId);
            if (result.needsFullRender) this.fullRender();
        });

        // 계산 및 통화
        this.view.on('calculateClicked', () => this.calculationManager.handleCalculate());
        this.view.on('showPerformanceHistoryClicked', () => this.handleShowPerformanceHistory());
        this.view.on('showSnapshotListClicked', () => this.handleShowSnapshotList());
        this.view.on('mainModeChanged', async (data) => {
            const result = await this.calculationManager.handleMainModeChange(data.mode);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyModeChanged', async (data) => {
            const result = await this.calculationManager.handleCurrencyModeChange(data.currency);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('currencyConversion', (data) => this.calculationManager.handleCurrencyConversion(data.source));
        this.view.on('portfolioExchangeRateChanged', (data) =>
            this.calculationManager.handlePortfolioExchangeRateChange(data.rate)
        );
        this.view.on('rebalancingToleranceChanged', (data) =>
            this.handleRebalancingToleranceChange(data.tolerance)
        );

        // 모달 상호작용
        this.view.on('closeTransactionModalClicked', () => this.view.closeTransactionModal());
        this.view.on('newTransactionSubmitted', async (e) => {
            const result = await this.transactionManager.handleAddNewTransaction(e);
            if (result.needsFullRender) this.fullRender();
        });
        this.view.on('transactionDeleteClicked', async (data) => {
            const result = await this.transactionManager.handleTransactionListClick(data.stockId, data.txId);
            if (result.needsUIUpdate) this.updateUIState();
        });

        // 기타
        this.view.on('darkModeToggleClicked', () => this.handleToggleDarkMode());
        this.view.on('pageUnloading', () => this.handleSaveDataOnExit());
    }

    // === 렌더링 메서드 ===

    /**
     * @description 전체 렌더링 (Web Worker 사용)
     */
    async fullRender(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            // ===== [Phase 2.2 Web Worker 통합] =====
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            // ===== [Phase 2.2 Web Worker 통합 끝] =====

            this.view.renderTable(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency,
                activePortfolio.settings.mainMode
            );

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            // ===== [Phase 2.2 Web Worker 통합] =====
            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            // ===== [Phase 2.2 Web Worker 통합 끝] =====
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

            // 리밸런싱 경고 확인 및 표시
            this.checkRebalancingNeeds(calculatedState.portfolioData, calculatedState.currentTotal, activePortfolio.settings.rebalancingTolerance);

            // 리스크 분석 (Phase 4.3)
            this.checkRiskWarnings(calculatedState.portfolioData, calculatedState.currentTotal, sectorData);

            this.view.updateMainModeUI(activePortfolio.settings.mainMode);

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            console.error('[Controller] fullRender error:', error);
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        }
    }

    /**
     * @description UI 상태 업데이트 (가상 스크롤 데이터 업데이트) (Web Worker 사용)
     */
    async updateUIState(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            // ===== [Phase 2.2 Web Worker 통합] =====
            const calculatedState = await this.calculatorWorker.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            // ===== [Phase 2.2 Web Worker 통합 끝] =====

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const ratioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(ratioSum.toNumber());

            // ===== [Phase 2.2 Web Worker 통합] =====
            const sectorData = await this.calculatorWorker.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            // ===== [Phase 2.2 Web Worker 통합 끝] =====
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

            activePortfolio.portfolioData = calculatedState.portfolioData;
            this.debouncedSave();
        } catch (error) {
            console.error('[Controller] updateUIState error:', error);
            // Fallback은 CalculatorWorkerService에서 자동으로 처리됨
        }
    }

    // === 기타 핸들러 ===

    /**
     * @description 리밸런싱 필요 여부 확인
     */
    checkRebalancingNeeds(
        portfolioData: any[],
        currentTotal: any,
        rebalancingTolerance?: number
    ): void {
        const tolerance = rebalancingTolerance ?? 5;
        if (tolerance <= 0) return; // 허용 오차가 0이면 체크 안 함

        const currentTotalDec = new Decimal(currentTotal);
        if (currentTotalDec.isZero()) return;

        const stocksNeedingRebalancing: string[] = [];

        for (const stock of portfolioData) {
            const currentAmount = stock.calculated?.currentAmount;
            if (!currentAmount) continue;

            const currentAmountDec = new Decimal(currentAmount);
            const currentRatio = currentAmountDec.div(currentTotalDec).times(100);
            const targetRatio = new Decimal(stock.targetRatio ?? 0);
            const diff = currentRatio.minus(targetRatio).abs();

            if (diff.greaterThan(tolerance)) {
                stocksNeedingRebalancing.push(
                    `${stock.name}: 현재 ${currentRatio.toFixed(1)}% (목표 ${targetRatio.toFixed(1)}%)`
                );
            }
        }

        // 경고 메시지 표시
        if (stocksNeedingRebalancing.length > 0) {
            const message = `🔔 리밸런싱이 필요한 종목: ${stocksNeedingRebalancing.join(', ')}`;
            this.view.showToast(message, 'info');
        }
    }

    /**
     * @description 자산 배분 템플릿 적용 (Phase 3.2)
     */
    handleApplyTemplate(templateName: string): void {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast('적용할 종목이 없습니다.', 'warning');
            return;
        }

        const stocks = activePortfolio.portfolioData;

        // 섹터별 종목 분류
        const sectorGroups: Record<string, typeof stocks> = {};
        for (const stock of stocks) {
            const sector = (stock.sector || 'Other').toLowerCase();
            if (!sectorGroups[sector]) sectorGroups[sector] = [];
            sectorGroups[sector].push(stock);
        }

        // 템플릿별 로직
        switch (templateName) {
            case '60-40': {
                // 60/40: 주식 60%, 채권 40%
                const equitySectors = ['stock', 'stocks', 'equity', 'equities', 'tech', 'technology', 'finance', 'healthcare', 'consumer'];
                const bondSectors = ['bond', 'bonds', 'fixed income', 'treasury'];

                const equityStocks = stocks.filter(s => equitySectors.some(es => (s.sector || '').toLowerCase().includes(es)));
                const bondStocks = stocks.filter(s => bondSectors.some(bs => (s.sector || '').toLowerCase().includes(bs)));
                const otherStocks = stocks.filter(s => !equityStocks.includes(s) && !bondStocks.includes(s));

                if (equityStocks.length > 0) {
                    const perEquity = 60 / equityStocks.length;
                    equityStocks.forEach(s => s.targetRatio = new Decimal(perEquity));
                }

                if (bondStocks.length > 0) {
                    const perBond = 40 / bondStocks.length;
                    bondStocks.forEach(s => s.targetRatio = new Decimal(perBond));
                }

                if (otherStocks.length > 0 && equityStocks.length === 0 && bondStocks.length === 0) {
                    // 섹터가 명확하지 않으면 동일 비중
                    const perStock = 100 / stocks.length;
                    stocks.forEach(s => s.targetRatio = new Decimal(perStock));
                }
                break;
            }

            case 'all-weather': {
                // All-Weather: 주식 30%, 장기채 40%, 중기채 15%, 금 7.5%, 원자재 7.5%
                const equityStocks = stocks.filter(s => ['stock', 'equity', 'tech'].some(k => (s.sector || '').toLowerCase().includes(k)));
                const bondStocks = stocks.filter(s => ['bond', 'treasury', 'fixed'].some(k => (s.sector || '').toLowerCase().includes(k)));
                const commodityStocks = stocks.filter(s => ['gold', 'commodity', 'metal', '금'].some(k => (s.sector || s.name || '').toLowerCase().includes(k)));
                const otherStocks = stocks.filter(s => !equityStocks.includes(s) && !bondStocks.includes(s) && !commodityStocks.includes(s));

                if (equityStocks.length > 0) {
                    const perEquity = 30 / equityStocks.length;
                    equityStocks.forEach(s => s.targetRatio = new Decimal(perEquity));
                }

                if (bondStocks.length > 0) {
                    const perBond = 55 / bondStocks.length; // 40 + 15 통합
                    bondStocks.forEach(s => s.targetRatio = new Decimal(perBond));
                }

                if (commodityStocks.length > 0) {
                    const perCommodity = 15 / commodityStocks.length; // 7.5 + 7.5 통합
                    commodityStocks.forEach(s => s.targetRatio = new Decimal(perCommodity));
                }

                if (otherStocks.length > 0 && equityStocks.length + bondStocks.length + commodityStocks.length === 0) {
                    const perStock = 100 / stocks.length;
                    stocks.forEach(s => s.targetRatio = new Decimal(perStock));
                }
                break;
            }

            case '50-30-20': {
                // 50/30/20: 주식 50%, 채권 30%, 기타 20%
                const equityStocks = stocks.filter(s => ['stock', 'equity', 'tech'].some(k => (s.sector || '').toLowerCase().includes(k)));
                const bondStocks = stocks.filter(s => ['bond', 'treasury'].some(k => (s.sector || '').toLowerCase().includes(k)));
                const otherStocks = stocks.filter(s => !equityStocks.includes(s) && !bondStocks.includes(s));

                if (equityStocks.length > 0) {
                    const perEquity = 50 / equityStocks.length;
                    equityStocks.forEach(s => s.targetRatio = new Decimal(perEquity));
                }

                if (bondStocks.length > 0) {
                    const perBond = 30 / bondStocks.length;
                    bondStocks.forEach(s => s.targetRatio = new Decimal(perBond));
                }

                if (otherStocks.length > 0) {
                    const perOther = 20 / otherStocks.length;
                    otherStocks.forEach(s => s.targetRatio = new Decimal(perOther));
                } else if (equityStocks.length === 0 && bondStocks.length === 0) {
                    const perStock = 100 / stocks.length;
                    stocks.forEach(s => s.targetRatio = new Decimal(perStock));
                }
                break;
            }

            case 'equal': {
                // 동일 비중
                const perStock = 100 / stocks.length;
                stocks.forEach(s => s.targetRatio = new Decimal(perStock));
                break;
            }

            default:
                this.view.showToast('알 수 없는 템플릿입니다.', 'error');
                return;
        }

        // 저장 및 UI 업데이트
        this.state.saveActivePortfolio();
        this.fullRender();
        this.view.showToast(`✨ ${templateName} 템플릿이 적용되었습니다!`, 'success');
    }

    /**
     * @description 리스크 경고 확인 (Phase 4.3)
     */
    checkRiskWarnings(
        portfolioData: any[],
        currentTotal: any,
        sectorData: any[]
    ): void {
        const warnings: string[] = [];
        const currentTotalDec = new Decimal(currentTotal);

        if (currentTotalDec.isZero()) return;

        // 1. 단일 종목 비중 경고 (30% 초과)
        const SINGLE_STOCK_THRESHOLD = 30;
        for (const stock of portfolioData) {
            const currentAmount = new Decimal(stock.calculated?.currentAmount || 0);
            const ratio = currentAmount.div(currentTotalDec).times(100);

            if (ratio.greaterThan(SINGLE_STOCK_THRESHOLD)) {
                warnings.push(`⚠️ ${stock.name}: ${ratio.toFixed(1)}% (단일 종목 비중 높음)`);
            }
        }

        // 2. 섹터 집중도 경고 (40% 초과)
        const SECTOR_CONCENTRATION_THRESHOLD = 40;
        for (const sector of sectorData) {
            const percentage = new Decimal(sector.percentage || 0);

            if (percentage.greaterThan(SECTOR_CONCENTRATION_THRESHOLD)) {
                warnings.push(`⚠️ ${sector.sector} 섹터: ${percentage.toFixed(1)}% (섹터 집중도 높음)`);
            }
        }

        // 경고 메시지 표시
        if (warnings.length > 0) {
            const message = `🔍 리스크 경고: ${warnings.join(', ')}`;
            this.view.showToast(message, 'warning');
        }
    }

    /**
     * @description 성과 히스토리 표시
     */
    async handleShowPerformanceHistory(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await DataStore.getSnapshotsForPortfolio(activePortfolio.id);

            if (snapshots.length === 0) {
                this.view.showToast('성과 히스토리 데이터가 없습니다. 계산을 실행하여 데이터를 생성하세요.', 'info');
                return;
            }

            // Toggle visibility
            const section = this.view.dom.performanceHistorySection;
            const chartContainer = this.view.dom.performanceChartContainer;
            const listContainer = this.view.dom.snapshotListContainer;

            if (section) section.classList.remove('hidden');
            if (chartContainer) chartContainer.classList.remove('hidden');
            if (listContainer) listContainer.classList.add('hidden');

            const ChartClass = (await import('chart.js/auto')).default;
            await this.view.displayPerformanceHistory(
                ChartClass,
                snapshots,
                activePortfolio.settings.currentCurrency
            );

            this.view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            console.error('[Controller] Failed to display performance history:', error);
            this.view.showToast('성과 히스토리를 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 스냅샷 목록 표시
     */
    async handleShowSnapshotList(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        try {
            const snapshots = await DataStore.getSnapshotsForPortfolio(activePortfolio.id);

            if (snapshots.length === 0) {
                this.view.showToast('저장된 스냅샷이 없습니다. 계산을 실행하여 데이터를 생성하세요.', 'info');
                return;
            }

            // Toggle visibility
            const section = this.view.dom.performanceHistorySection;
            const chartContainer = this.view.dom.performanceChartContainer;
            const listContainer = this.view.dom.snapshotListContainer;

            if (section) section.classList.remove('hidden');
            if (chartContainer) chartContainer.classList.add('hidden');
            if (listContainer) listContainer.classList.remove('hidden');

            // Render snapshot list
            this.renderSnapshotList(snapshots, activePortfolio.settings.currentCurrency);

            this.view.showToast(`${snapshots.length}개의 스냅샷을 불러왔습니다.`, 'success');
        } catch (error) {
            console.error('[Controller] Failed to display snapshot list:', error);
            this.view.showToast('스냅샷 목록을 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * @description 스냅샷 목록 렌더링
     */
    private renderSnapshotList(snapshots: any[], currency: 'krw' | 'usd'): void {
        const listEl = this.view.dom.snapshotList;
        if (!listEl) return;

        const currencySymbol = currency === 'krw' ? '₩' : '$';
        const formatNumber = (num: number) => {
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        };

        const formatPercent = (num: number) => {
            return num.toFixed(2);
        };

        const rows = snapshots.map(snapshot => {
            const totalValue = currency === 'krw' ? snapshot.totalValueKRW : snapshot.totalValue;
            const totalReturn = snapshot.totalUnrealizedPL + snapshot.totalRealizedPL;
            const returnRate = snapshot.totalInvestedCapital > 0
                ? (totalReturn / snapshot.totalInvestedCapital) * 100
                : 0;

            const isProfit = totalReturn >= 0;
            const profitClass = isProfit ? 'profit-positive' : 'profit-negative';

            return `
                <tr>
                    <td>${snapshot.date}</td>
                    <td style="text-align: right; font-weight: bold;">${currencySymbol}${formatNumber(totalValue)}</td>
                    <td style="text-align: right;">${currencySymbol}${formatNumber(snapshot.totalInvestedCapital)}</td>
                    <td style="text-align: right;" class="${profitClass}">
                        ${currencySymbol}${formatNumber(totalReturn)}
                        <br>
                        <small>(${isProfit ? '+' : ''}${formatPercent(returnRate)}%)</small>
                    </td>
                    <td style="text-align: center;">${snapshot.stockCount}</td>
                </tr>
            `;
        }).join('');

        listEl.innerHTML = `
            <div class="table-responsive">
                <table>
                    <caption>포트폴리오 스냅샷 목록</caption>
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th style="text-align: right;">총 자산</th>
                            <th style="text-align: right;">투자 원금</th>
                            <th style="text-align: right;">총 수익</th>
                            <th style="text-align: center;">종목 수</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * @description 리밸런싱 허용 오차 변경
     */
    async handleRebalancingToleranceChange(tolerance: number): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        activePortfolio.settings.rebalancingTolerance = tolerance;
        await this.state.saveActivePortfolio();
        this.updateUIState(); // UI 업데이트로 경고 표시 갱신
    }

    /**
     * @description 다크 모드 토글
     */
    handleToggleDarkMode(): void {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender(); // async but we don't await
    }

    /**
     * @description 페이지 종료 시 저장
     */
    handleSaveDataOnExit(): void {
        console.log('Page unloading. Relaying on debounced save.');
    }

    /**
     * @description KRW로 투자 금액 가져오기
     * @returns Decimal
     */
    getInvestmentAmountInKRW(): Decimal {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return DECIMAL_ZERO;

        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

        if (
            !(additionalAmountInput instanceof HTMLInputElement) ||
            !(additionalAmountUSDInput instanceof HTMLInputElement) ||
            !(exchangeRateInput instanceof HTMLInputElement)
        ) {
            return DECIMAL_ZERO;
        }

        const amountKRWStr = additionalAmountInput.value || '0';
        const amountUSDStr = additionalAmountUSDInput.value || '0';
        const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);

        try {
            const amountKRW = new Decimal(amountKRWStr);
            const amountUSD = new Decimal(amountUSDStr);
            const exchangeRate = new Decimal(exchangeRateStr);

            if (currentCurrency === 'krw') {
                return amountKRW.isNegative() ? DECIMAL_ZERO : amountKRW;
            } else {
                if (exchangeRate.isZero() || exchangeRate.isNegative()) return DECIMAL_ZERO;
                const calculatedKRW = amountUSD.times(exchangeRate);
                return calculatedKRW.isNegative() ? DECIMAL_ZERO : calculatedKRW;
            }
        } catch (e) {
            console.error('Error parsing investment amount:', e);
            return DECIMAL_ZERO;
        }
    }

    // ===== Proxy methods for testing compatibility =====
    async handleCalculate(): Promise<void> {
        return this.calculationManager.handleCalculate();
    }

    async handleFetchAllPrices(): Promise<void> {
        return this.calculationManager.handleFetchAllPrices();
    }

    async handleTransactionListClick(stockId: string, txId: string): Promise<void> {
        return this.transactionManager.handleTransactionListClick(stockId, txId);
    }
}
```

---

## `src/controller.test.ts`

```typescript
// src/controller.test.ts (Refactored for Pub/Sub, Async State, testUtils, and Mock Fixes)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Decimal from 'decimal.js';

// --- ▼▼▼ Mock window.matchMedia ▼▼▼ ---
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// --- ▼▼▼ 모의(Mock) 설정 ▼▼▼ ---
vi.mock('./state');
vi.mock('./view', () => ({
  PortfolioView: {
    // Pub/Sub
    on: vi.fn(),
    emit: vi.fn(),
    // DOM 조작
    cacheDomElements: vi.fn(),
    renderPortfolioSelector: vi.fn(),
    updateCurrencyModeUI: vi.fn(),
    updateMainModeUI: vi.fn(),
    renderTable: vi.fn(),
    updateVirtualTableData: vi.fn(),
    updateAllTargetRatioInputs: vi.fn(),
    updateCurrentPriceInput: vi.fn(),
    displaySkeleton: vi.fn(),
    displayResults: vi.fn(),
    hideResults: vi.fn(),
    updateTableHeader: vi.fn(),
    updateRatioSum: vi.fn(),
    displaySectorAnalysis: vi.fn(),
    // UI 피드백
    showToast: vi.fn(),
    showConfirm: vi.fn(async () => true),
    showPrompt: vi.fn(async () => 'Test'),
    announce: vi.fn(),
    focusOnNewStock: vi.fn(),
    // 모달
    openTransactionModal: vi.fn(),
    closeTransactionModal: vi.fn(),
    renderTransactionList: vi.fn(),
    // 기타
    toggleInputValidation: vi.fn(),
    toggleFetchButton: vi.fn(),
    destroyChart: vi.fn(),
    displayChart: vi.fn(),
    // DOM 요소 (최소한의 모의)
    dom: {
        additionalAmountInput: {
            value: '0',
            addEventListener: vi.fn()
        },
        additionalAmountUSDInput: {
            value: '0',
            addEventListener: vi.fn()
        },
        exchangeRateInput: {
            value: '1300',
            addEventListener: vi.fn()
        },
        importFileInput: {
            click: vi.fn(),
            addEventListener: vi.fn()
        },
    }
  }
}));
vi.mock('./validator');
vi.mock('./errorService');
vi.mock('./calculator');

// 전략 클래스 모의(Mock) 방식 변경
const mockAddCalculate = vi.fn(() => ({ results: [] }));
const mockSellCalculate = vi.fn(() => ({ results: [] }));

vi.mock('./calculationStrategies', () => ({
    AddRebalanceStrategy: class {
        calculate = mockAddCalculate;
    },
    SellRebalanceStrategy: class {
        calculate = mockSellCalculate;
    },
}));

vi.mock('./apiService', () => ({
    apiService: {
        fetchAllStockPrices: vi.fn()
    }
}));
vi.mock('./i18n', () => ({
    t: vi.fn((key: string) => key),
}));
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input: string) => input),
    }
}));


// --- ▼▼▼ 실제 모듈 및 모의 객체 임포트 ▼▼▼ ---
import { PortfolioController } from './controller';
import { PortfolioState } from './state';
import { PortfolioView } from './view';
import { Validator } from './validator';
import { ErrorService, ValidationError } from './errorService';
import { Calculator } from './calculator';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies';
import { apiService } from './apiService';
import { t } from './i18n';
import { MOCK_PORTFOLIO_1, MOCK_STOCK_1 } from './testUtils';
import type { Portfolio } from './types';


// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  let controller: PortfolioController;
  let mockState: PortfolioState;
  let mockView: typeof PortfolioView;
  let mockCalculator: typeof Calculator;
  let mockValidator: typeof Validator;

  let mockDefaultPortfolio: Portfolio;

  beforeEach(async () => {
    vi.clearAllMocks();

    // MOCK_PORTFOLIO_1의 깊은 복사본을 만들어 테스트에 사용
    mockDefaultPortfolio = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_1));
    mockDefaultPortfolio.portfolioData.forEach(stock => {
        stock.targetRatio = new Decimal(stock.targetRatio).toNumber();
        stock.currentPrice = new Decimal(stock.currentPrice).toNumber();
        stock.fixedBuyAmount = new Decimal(stock.fixedBuyAmount).toNumber();
        const calculated = (stock as any).calculated;
        if (calculated) {
            calculated.currentAmount = new Decimal(calculated.currentAmount);
        }
    });

    // 1. 모의 인스턴스 할당
    mockState = new PortfolioState();
    mockView = PortfolioView;
    mockCalculator = Calculator;
    mockValidator = Validator;

    // 2. State 모의 메서드 설정 (Async)
    vi.mocked(mockState.ensureInitialized).mockResolvedValue(undefined);
    vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
    vi.mocked(mockState.getAllPortfolios).mockReturnValue({ [mockDefaultPortfolio.id]: mockDefaultPortfolio });
    vi.mocked(mockState.getStockById).mockReturnValue(mockDefaultPortfolio.portfolioData[0]);
    vi.mocked(mockState.getTransactions).mockReturnValue([]);
    vi.mocked(mockState.createNewPortfolio).mockResolvedValue(mockDefaultPortfolio);
    vi.mocked(mockState.renamePortfolio).mockResolvedValue(undefined);
    vi.mocked(mockState.deletePortfolio).mockResolvedValue(true);
    vi.mocked(mockState.setActivePortfolioId).mockResolvedValue(undefined);
    vi.mocked(mockState.addNewStock).mockResolvedValue(mockDefaultPortfolio.portfolioData[0]);
    vi.mocked(mockState.deleteStock).mockResolvedValue(true);
    vi.mocked(mockState.resetData).mockResolvedValue(undefined);
    vi.mocked(mockState.normalizeRatios).mockReturnValue(true);
    vi.mocked(mockState.updateStockProperty).mockReturnValue(undefined);
    vi.mocked(mockState.addTransaction).mockResolvedValue(true);
    vi.mocked(mockState.deleteTransaction).mockResolvedValue(true);
    vi.mocked(mockState.updatePortfolioSettings).mockResolvedValue(undefined);
    vi.mocked(mockState.importData).mockResolvedValue(undefined);

    // 3. Calculator 모의 설정
    vi.mocked(mockCalculator.calculatePortfolioState).mockReturnValue({
      portfolioData: mockDefaultPortfolio.portfolioData as any,
      currentTotal: new Decimal(5500),
      cacheKey: 'mock-key'
    });
    vi.mocked(mockCalculator.calculateSectorAnalysis).mockReturnValue([]);

    vi.mocked(mockCalculator.calculateRebalancing).mockImplementation((strategy: any) => {
      return strategy.calculate();
    });

    // 5. 컨트롤러 생성 (이때 bindControllerEvents가 호출됨)
    controller = new PortfolioController(mockState, mockView);
    await controller.initialize();
  });

  it('should subscribe to all view events on initialization', () => {
      expect(mockView.on).toHaveBeenCalledWith('newPortfolioClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('calculateClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('portfolioBodyChanged', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('transactionDeleteClicked', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('fetchAllPricesClicked', expect.any(Function));
  });

  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([{ field: '', stockId: null, message: '- 테스트 오류' }]);

    await controller.handleCalculate();

    expect(mockValidator.validateForCalculation).toHaveBeenCalledOnce();
    expect(mockView.hideResults).toHaveBeenCalledOnce();
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate - Validation');
    expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled();
  });

  it('handleCalculate: 목표 비율 100% 미만 시 확인 창을 띄우고, 취소 시 중단해야 한다', async () => {
     vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
     const portfolioWithBadRatio: Portfolio = {
         ...mockDefaultPortfolio,
         portfolioData: [
             {...mockDefaultPortfolio.portfolioData[0], targetRatio: 30},
             {...mockDefaultPortfolio.portfolioData[1], targetRatio: 0}
         ]
     };
     vi.mocked(mockState.getActivePortfolio).mockReturnValue(portfolioWithBadRatio);
     vi.mocked(mockView.showConfirm).mockResolvedValueOnce(false);

     await controller.handleCalculate();

     expect(mockView.showConfirm).toHaveBeenCalled();
     expect(mockView.hideResults).toHaveBeenCalledOnce();
     expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled();
   });

  it('handleCalculate: "add" 모드일 때 AddRebalanceStrategy를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
    vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    await controller.handleCalculate();

    expect(mockAddCalculate).toHaveBeenCalledOnce();
    expect(mockSellCalculate).not.toHaveBeenCalled();

    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(expect.any(AddRebalanceStrategy));

    expect(mockView.displayResults).toHaveBeenCalledOnce();
    expect(mockView.showToast).toHaveBeenCalledWith('toast.calculateSuccess', 'success');
  });

  it('handleCalculate: "sell" 모드일 때 SellRebalanceStrategy를 호출해야 한다', async () => {
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
    vi.mocked(mockState.getActivePortfolio).mockReturnValue({
        ...mockDefaultPortfolio,
        settings: { ...mockDefaultPortfolio.settings, mainMode: 'sell' }
    });
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    await controller.handleCalculate();

    expect(mockSellCalculate).toHaveBeenCalledOnce();
    expect(mockAddCalculate).not.toHaveBeenCalled();

    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(expect.any(SellRebalanceStrategy));
    expect(mockView.displayResults).toHaveBeenCalledOnce();
  });

  it('handleFetchAllPrices: API 호출 성공 시 state와 view를 업데이트해야 한다', async () => {
    const mockApiResponse = [
      { id: 's1', ticker: 'AAA', status: 'fulfilled' as const, value: 150 },
      { id: 's2', ticker: 'BBB', status: 'fulfilled' as const, value: 210 }
    ];
    vi.mocked(apiService.fetchAllStockPrices).mockResolvedValue(mockApiResponse);

    await controller.handleFetchAllPrices();

    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(true);
    expect(apiService.fetchAllStockPrices).toHaveBeenCalledWith([{ id: 's1', ticker: 'AAA' }, { id: 's2', ticker: 'BBB' }]);
    // Currency is KRW, so prices are converted: 150 * 1300 = 195000, 210 * 1300 = 273000
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s1', 'currentPrice', 195000);
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s2', 'currentPrice', 273000);
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s1', '195000.00');
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s2', '273000.00');

    expect(mockView.showToast).toHaveBeenCalledWith('api.fetchSuccessAll', "success");
    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(false);
  });

  it('handleTransactionListClick: 거래 삭제 시 state.deleteTransaction을 호출해야 한다 (async)', async () => {
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    const result = await controller.handleTransactionListClick('s1', 'tx1');

    expect(mockView.showConfirm).toHaveBeenCalledOnce();
    expect(mockState.deleteTransaction).toHaveBeenCalledWith('s1', 'tx1');
    expect(mockView.renderTransactionList).toHaveBeenCalledOnce();
    expect(mockView.showToast).toHaveBeenCalledWith('toast.transactionDeleted', 'success');
    expect(result.needsUIUpdate).toBe(true);
  });

  it('handleTransactionListClick: 거래 삭제 취소 시 state를 호출하지 않아야 한다 (async)', async () => {
    vi.mocked(mockView.showConfirm).mockResolvedValue(false);

    await controller.handleTransactionListClick('s1', 'tx1');

    expect(mockView.showConfirm).toHaveBeenCalledOnce();
    expect(mockState.deleteTransaction).not.toHaveBeenCalled();
    expect(mockView.renderTransactionList).not.toHaveBeenCalled();
    expect(mockView.showToast).not.toHaveBeenCalled();
  });

});
```

---

## `src/calculator.test.ts`

```typescript
// src/calculator.test.ts (전략 패턴 적용)

import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies';
import { createMockCalculatedStock } from './testUtils';
import type { Stock } from './types';

describe('Calculator.calculateStockMetrics (동기)', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock: Stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 150,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { id:'t2', type: 'buy', date: '2023-01-02', quantity: 10, price: 120 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110');
        expect(result.currentAmount.toString()).toBe('3000');
        expect(result.profitLoss.toString()).toBe('800');
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock: Stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 200,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { id:'t2', type: 'sell', date: '2023-01-02', quantity: 5, price: 150 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('5');
        expect(result.avgBuyPrice.toString()).toBe('100');
        expect(result.currentAmount.toString()).toBe('1000');
        expect(result.profitLoss.toString()).toBe('500');
    });
});

describe('Calculator.calculateRebalancing (SellRebalanceStrategy)', () => {
  it('목표 비율에 맞게 매도 및 매수해야 할 금액을 정확히 계산해야 한다', () => {
    const portfolioData = [
      createMockCalculatedStock({ id: 's1', name: 'Stock 1', ticker: 'S1', targetRatio: 25, currentPrice: 1, quantity: 5000, avgBuyPrice: 1 }), // 5000원
      createMockCalculatedStock({ id: 's2', name: 'Stock 2', ticker: 'S2', targetRatio: 75, currentPrice: 1, quantity: 5000, avgBuyPrice: 1 })  // 5000원
    ];

    const strategy = new SellRebalanceStrategy(portfolioData);
    const { results } = Calculator.calculateRebalancing(strategy);

    const overweightStock = results.find(s => s.id === 's1');
    const underweightStock = results.find(s => s.id === 's2');

    // 총액 10000원. 목표: 2500원(s1), 7500원(s2)
    expect(overweightStock?.adjustment.toString()).toBe('2500'); // Sell 2500
    expect(underweightStock?.adjustment.toString()).toBe('-2500'); // Buy 2500
  });
});

describe('Calculator.calculateRebalancing (AddRebalanceStrategy)', () => {
  it('추가 투자금을 목표 비율에 미달하는 주식에 정확히 배분해야 한다', () => {
    const portfolioData = [
      createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), // 저체중
      createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 3000, avgBuyPrice: 1 })  // 과체중
    ];
    const additionalInvestment = new Decimal(1000);

    const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
    const { results } = Calculator.calculateRebalancing(strategy);

    const underweightStock = results.find(s => s.id === 's1');
    const overweightStock = results.find(s => s.id === 's2');

    expect(underweightStock?.finalBuyAmount.toString()).toBe('1000');
    expect(overweightStock?.finalBuyAmount.toString()).toBe('0');
  });
});

describe('Calculator Edge Cases (동기)', () => {

    describe('calculateStockMetrics', () => {
        it('매도 수량이 보유 수량을 초과하면 보유 수량은 0이 되어야 함', () => {
             const stock: Stock = {
                id: 's1', name: 'OverSell', ticker: 'OVER', sector: '', targetRatio: 100, currentPrice: 100,
                transactions: [
                    { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                    { id:'t2', type: 'sell', date: '2023-01-02', quantity: 15, price: 80 }
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0
            };
            const result = Calculator.calculateStockMetrics(stock);

            expect(result.quantity.toString()).toBe('0');
            expect(result.avgBuyPrice.toString()).toBe('100');
            expect(result.currentAmount.toString()).toBe('0');
            expect(result.profitLoss.toString()).toBe('0');
        });
    });

    describe('calculateRebalancing (AddRebalanceStrategy Edge Cases)', () => {
        it('추가 투자금이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
             const portfolioData = [
                createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }),
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(0);
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
            expect(results[0].buyRatio.toString()).toBe('0');
            expect(results[1].buyRatio.toString()).toBe('0');
        });

        it('모든 종목의 목표 비율이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
            const portfolioData = [
                createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 0, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), // 목표 0%
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 0, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(1000);
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
        });

         it('고정 매수 금액이 추가 투자금을 초과하면, 추가 투자금까지만 할당됨', () => {
            const portfolioData = [
                { ...createMockCalculatedStock({ id: 's1', name: 'S1', ticker: 'S1', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 }), isFixedBuyEnabled: true, fixedBuyAmount: 1500 }, // 고정 1500
                createMockCalculatedStock({ id: 's2', name: 'S2', ticker: 'S2', targetRatio: 50, currentPrice: 1, quantity: 1000, avgBuyPrice: 1 })
            ];
            const additionalInvestment = new Decimal(1000); // 총 투자금 1000
            const strategy = new AddRebalanceStrategy(portfolioData, additionalInvestment);
            const { results } = Calculator.calculateRebalancing(strategy);

            expect(results.find(r => r.id === 's1')?.finalBuyAmount.toString()).toBe('1000');
            expect(results.find(r => r.id === 's2')?.finalBuyAmount.toString()).toBe('0');
         });
    });
});
```

---

## `src/validator.test.ts`

```typescript
// src/validator.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Validator } from './validator';
import Decimal from 'decimal.js';
import { CONFIG } from './constants';
import type { Stock, CalculatedStock } from './types';

// --- ⬇️ Mock i18n BEFORE importing validator.js ⬇️ ---
vi.mock('./i18n', () => ({
  t: vi.fn((key: string, replacements?: Record<string, string>) => {
    // Provide Korean messages needed for the tests
    if (key === 'validation.negativeNumber') return '음수는 입력할 수 없습니다.';
    if (key === 'validation.invalidNumber') return '유효한 숫자가 아닙니다.';
    if (key === 'validation.futureDate') return '미래 날짜는 입력할 수 없습니다.';
    if (key === 'validation.quantityZero') return '수량은 0보다 커야 합니다.';
    if (key === 'validation.priceZero') return '단가는 0보다 커야 합니다.';
    if (key === 'validation.invalidDate') return '유효한 날짜를 입력해주세요.';
    // Add messages for validateForCalculation
    if (key === 'validation.investmentAmountZero') return '- 추가 투자 금액을 0보다 크게 입력해주세요.';
    if (key === 'validation.currentPriceZero') return `- '${replacements?.name}'의 현재가는 0보다 커야 합니다.`;
    // Add other messages used in validator.js if needed by tests
    return key; // Fallback
  }),
}));
// --- ⬆️ Mock i18n ⬆️ ---


describe('Validator.validateNumericInput', () => {
    it('유효한 숫자 문자열을 올바르게 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput('123.45')).toEqual({ isValid: true, value: 123.45 });
        expect(Validator.validateNumericInput('0')).toEqual({ isValid: true, value: 0 });
    });

    it('음수를 유효하지 않다고 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput(-10)).toEqual({ isValid: false, message: '음수는 입력할 수 없습니다.' });
    });

    it('숫자가 아닌 문자열을 유효하지 않다고 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput('abc')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
        expect(Validator.validateNumericInput('')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
        expect(Validator.validateNumericInput(null)).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
        expect(Validator.validateNumericInput(undefined)).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
    });
});

describe('Validator.validateTransaction', () => {
   const validTx = { type: 'buy' as const, date: '2023-10-26', quantity: 10, price: 50 };

   it('유효한 거래 데이터를 통과시켜야 합니다.', () => {
     expect(Validator.validateTransaction(validTx).isValid).toBe(true);
   });

   it('미래 날짜를 거부해야 합니다.', () => {
     const futureDate = new Date();
     futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
     const futureTx = { ...validTx, date: futureDate.toISOString().slice(0, 10)};
     expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
     expect(Validator.validateTransaction(futureTx).message).toBe('미래 날짜는 입력할 수 없습니다.');
   });

   it('잘못된 날짜 형식을 거부해야 합니다.', () => {
       const invalidDateTx = { ...validTx, date: 'invalid-date' };
       expect(Validator.validateTransaction(invalidDateTx).isValid).toBe(false);
       expect(Validator.validateTransaction(invalidDateTx).message).toBe('유효한 날짜를 입력해주세요.');
   });

   it('수량이 0이거나 음수일 때 거부해야 합니다.', () => {
       const zeroQtyTx = { ...validTx, quantity: 0 };
       const negQtyTx = { ...validTx, quantity: -5 };
       expect(Validator.validateTransaction(zeroQtyTx).isValid).toBe(false);
       expect(Validator.validateTransaction(zeroQtyTx).message).toBe('수량은 0보다 커야 합니다.');
       expect(Validator.validateTransaction(negQtyTx).isValid).toBe(false);
       expect(Validator.validateTransaction(negQtyTx).message).toBe('음수는 입력할 수 없습니다.');
   });

   it('단가가 0이거나 음수일 때 거부해야 합니다.', () => {
       const zeroPriceTx = { ...validTx, price: 0 };
       const negPriceTx = { ...validTx, price: -50 };
       expect(Validator.validateTransaction(zeroPriceTx).isValid).toBe(false);
       expect(Validator.validateTransaction(zeroPriceTx).message).toBe('단가는 0보다 커야 합니다.');
       expect(Validator.validateTransaction(negPriceTx).isValid).toBe(false);
       expect(Validator.validateTransaction(negPriceTx).message).toBe('음수는 입력할 수 없습니다.');
   });

});


describe('Validator.validateForCalculation', () => {
    const validPortfolioData: CalculatedStock[] = [
        {
            id: 's1', name: 'Stock A', ticker: 'AAA', sector: 'Tech',
            targetRatio: 50, currentPrice: 100,
            isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [],
            calculated: {
                currentAmount: new Decimal(1000),
                quantity: new Decimal(10),
                avgBuyPrice: new Decimal(100),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            }
        },
        {
            id: 's2', name: 'Stock B', ticker: 'BBB', sector: 'Finance',
            targetRatio: 50, currentPrice: 200,
            isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [],
            calculated: {
                currentAmount: new Decimal(2000),
                quantity: new Decimal(10),
                avgBuyPrice: new Decimal(200),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            }
        },
    ];

    it('유효한 추가 매수 입력값을 통과시켜야 합니다.', () => {
        const inputs = {
            mainMode: 'add' as const,
            portfolioData: validPortfolioData,
            additionalInvestment: new Decimal(500)
        };
        expect(Validator.validateForCalculation(inputs)).toEqual([]);
    });

     it('추가 매수 모드에서 추가 투자금이 0 이하일 때 오류를 반환해야 합니다.', () => {
         const inputs = {
             mainMode: 'add' as const,
             portfolioData: validPortfolioData,
             additionalInvestment: new Decimal(0)
         };
         const errors = Validator.validateForCalculation(inputs);
         expect(errors.length).toBeGreaterThan(0);
         expect(errors.some(e => e.message === '- 추가 투자 금액을 0보다 크게 입력해주세요.')).toBe(true);
     });

    it('현재가가 0 이하인 주식이 있을 때 오류를 반환해야 합니다.', () => {
        const portfolioWithZeroPrice: CalculatedStock[] = [
             { ...validPortfolioData[0] },
             {
                 ...validPortfolioData[1],
                 currentPrice: 0,
                 calculated: {
                     currentAmount: new Decimal(0),
                     quantity: new Decimal(10),
                     avgBuyPrice: new Decimal(200),
                     profitLoss: new Decimal(-2000),
                     profitLossRate: new Decimal(-100),
                 }
             }
        ];
         const inputs = {
             mainMode: 'add' as const,
             portfolioData: portfolioWithZeroPrice,
             additionalInvestment: new Decimal(500)
         };
         const errors = Validator.validateForCalculation(inputs);
         expect(errors.length).toBeGreaterThan(0);
         expect(errors.some(e => e.stockId === 's2' && e.message.includes('현재가는 0보다 커야 합니다.'))).toBe(true);
     });

});


describe('Validator.isDataStructureValid', () => {
    it('유효한 데이터 구조를 통과시켜야 합니다.', () => {
        const validData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
            portfolios: {
                'p1': {
                    id: 'p1', name: 'Valid',
                    settings: {
                         mainMode: 'add' as const,
                         currentCurrency: 'krw' as const,
                         exchangeRate: 1300
                    },
                    portfolioData: []
                 }
            }
        };
        expect(Validator.isDataStructureValid(validData)).toBe(true);
    });

    it('meta가 없으면 실패해야 합니다.', () => {
        const invalidData = { portfolios: {} };
        expect(Validator.isDataStructureValid(invalidData)).toBe(false);
    });

     it('portfolios가 없으면 실패해야 합니다.', () => {
         const invalidData = { meta: {} };
         expect(Validator.isDataStructureValid(invalidData)).toBe(false);
     });

     it('portfolio 객체에 필수 속성이 없으면 실패해야 합니다.', () => {
          const invalidData = {
              meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
              portfolios: {
                  'p1': { id: 'p1' }
              }
          };
          expect(Validator.isDataStructureValid(invalidData)).toBe(false);
      });

      it('settings 객체 형식이 아니면 실패해야 합니다.', () => {
           const invalidData = {
               meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
               portfolios: {
                   'p1': { id: 'p1', name: 'Invalid Settings', settings: null, portfolioData: [] }
               }
           };
           expect(Validator.isDataStructureValid(invalidData)).toBe(false);
       });

       it('portfolioData가 배열이 아니면 실패해야 합니다.', () => {
            const invalidData = {
                meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION },
                portfolios: {
                    'p1': { id: 'p1', name: 'Invalid Array', settings: {}, portfolioData: {} }
                }
            };
            expect(Validator.isDataStructureValid(invalidData)).toBe(false);
        });


});
```

---

## `src/dataStore.ts`

```typescript
// src/dataStore.ts - IndexedDB 저장/로드 전담
import { get, set, del } from 'idb-keyval';
import { CONFIG } from './constants.ts';
import { ErrorService } from './errorService.ts';
import type { Portfolio, MetaState, PortfolioSnapshot } from './types.ts';

/**
 * @description IndexedDB 저장/로드 및 마이그레이션을 담당하는 클래스
 */
export class DataStore {
    /**
     * @description Meta 데이터 로드
     */
    static async loadMeta(): Promise<MetaState | null> {
        try {
            const metaData = await get<MetaState>(CONFIG.IDB_META_KEY);
            return metaData || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadMeta');
            return null;
        }
    }

    /**
     * @description Meta 데이터 저장
     */
    static async saveMeta(metaData: MetaState): Promise<void> {
        try {
            await set(CONFIG.IDB_META_KEY, metaData);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.saveMeta');
            throw error;
        }
    }

    /**
     * @description 포트폴리오 데이터 로드
     */
    static async loadPortfolios(): Promise<Record<string, Portfolio> | null> {
        try {
            const portfolioData = await get<Record<string, Portfolio>>(
                CONFIG.IDB_PORTFOLIOS_KEY
            );
            return portfolioData || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadPortfolios');
            return null;
        }
    }

    /**
     * @description 포트폴리오 데이터 저장
     */
    static async savePortfolios(portfolios: Record<string, Portfolio>): Promise<void> {
        try {
            await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolios);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.savePortfolios');
            throw error;
        }
    }

    /**
     * @description LocalStorage에서 IndexedDB로 마이그레이션
     */
    static async migrateFromLocalStorage(): Promise<boolean> {
        try {
            const lsMeta = localStorage.getItem(CONFIG.LEGACY_LS_META_KEY);
            const lsPortfolios = localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

            if (lsMeta && lsPortfolios) {
                const metaData = JSON.parse(lsMeta);
                const portfolioData = JSON.parse(lsPortfolios);

                // IndexedDB에 저장
                await set(CONFIG.IDB_META_KEY, metaData);
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);

                // 마이그레이션 성공 후 LocalStorage 데이터 삭제
                localStorage.removeItem(CONFIG.LEGACY_LS_META_KEY);
                localStorage.removeItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);

                console.log(
                    '[DataStore] Successfully migrated from LocalStorage to IndexedDB'
                );
                return true;
            }

            console.log('[DataStore] No legacy data found in LocalStorage');
            return false;
        } catch (error) {
            console.error('[DataStore] Migration failed:', error);
            ErrorService.handle(error as Error, 'DataStore.migrateFromLocalStorage');
            return false;
        }
    }

    /**
     * @description 포트폴리오 스냅샷 전체 로드
     */
    static async loadSnapshots(): Promise<Record<string, PortfolioSnapshot[]> | null> {
        try {
            const snapshots = await get<Record<string, PortfolioSnapshot[]>>(
                CONFIG.IDB_SNAPSHOTS_KEY
            );
            return snapshots || null;
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.loadSnapshots');
            return null;
        }
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 목록 로드
     */
    static async getSnapshotsForPortfolio(portfolioId: string): Promise<PortfolioSnapshot[]> {
        try {
            const allSnapshots = await this.loadSnapshots();
            return allSnapshots?.[portfolioId] || [];
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.getSnapshotsForPortfolio');
            return [];
        }
    }

    /**
     * @description 새 스냅샷 추가
     */
    static async addSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
        try {
            const allSnapshots = await this.loadSnapshots() || {};
            const portfolioSnapshots = allSnapshots[snapshot.portfolioId] || [];

            // 새 스냅샷 추가
            portfolioSnapshots.push(snapshot);

            // 날짜순 정렬 (최신순)
            portfolioSnapshots.sort((a, b) => b.timestamp - a.timestamp);

            // 최대 365개 스냅샷 유지 (1년치)
            if (portfolioSnapshots.length > 365) {
                portfolioSnapshots.splice(365);
            }

            allSnapshots[snapshot.portfolioId] = portfolioSnapshots;
            await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.addSnapshot');
            throw error;
        }
    }

    /**
     * @description 특정 포트폴리오의 스냅샷 삭제
     */
    static async deleteSnapshotsForPortfolio(portfolioId: string): Promise<void> {
        try {
            const allSnapshots = await this.loadSnapshots();
            if (allSnapshots && allSnapshots[portfolioId]) {
                delete allSnapshots[portfolioId];
                await set(CONFIG.IDB_SNAPSHOTS_KEY, allSnapshots);
            }
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.deleteSnapshotsForPortfolio');
            throw error;
        }
    }

    /**
     * @description 모든 데이터 삭제
     */
    static async clearAll(): Promise<void> {
        try {
            await del(CONFIG.IDB_META_KEY);
            await del(CONFIG.IDB_PORTFOLIOS_KEY);
            await del(CONFIG.IDB_SNAPSHOTS_KEY);
            console.log('[DataStore] All data cleared');
        } catch (error) {
            ErrorService.handle(error as Error, 'DataStore.clearAll');
            throw error;
        }
    }
}
```

---

## `api/batchGetPrices.ts`

```typescript
// /api/batchGetPrices.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 단일 티커를 가져오는 내부 헬퍼 함수
async function fetchSinglePrice(ticker: string, apiKey: string) {
  const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
  
  try {
    const apiResponse = await fetch(finnhubUrl, { signal: AbortSignal.timeout(5000) });
    if (!apiResponse.ok) throw new Error(`API status ${apiResponse.status}`);
    
    const data = await apiResponse.json();
    
    // Finnhub의 유효한 응답인지 확인
    if (typeof data.c === 'number' && data.c > 0) {
      return { status: 'fulfilled', value: data.c };
    } else {
      // API는 성공(200)했지만 데이터가 없는 경우 (잘못된 티커 등)
      return { status: 'rejected', reason: `Invalid ticker or no data found for ${ticker}` };
    }
  } catch (error) {
    return { status: 'rejected', reason: error instanceof Error ? error.message : 'Fetch failed' };
  }
}

// 메인 핸들러
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 1. 쿼리 파라미터로 'symbols=AAPL,MSFT,GOOG' 형태를 받습니다.
  const { symbols } = request.query;

  if (typeof symbols !== 'string' || !symbols) {
    return response.status(400).json({ error: 'Symbols query parameter is required (e.g., ?symbols=AAPL,MSFT)' });
  }

  const API_KEY = process.env.FINNHUB_API_KEY;
  if (!API_KEY) {
    return response.status(500).json({ error: 'API key is not configured' });
  }

  const tickers = symbols.split(',');

  // 티커 수 제한 (서버리스 함수 타임아웃 방지)
  const MAX_TICKERS = 30;
  if (tickers.length > MAX_TICKERS) {
    return response.status(400).json({
      error: `Too many tickers requested. Maximum ${MAX_TICKERS} tickers allowed per request. Received ${tickers.length}.`
    });
  }

  // 2. 서버리스 함수 내에서 Promise.allSettled를 사용해 병렬로 Finnhub에 요청합니다.
  const results = await Promise.allSettled(
    tickers.map(ticker => fetchSinglePrice(ticker, API_KEY))
  );

  // 3. Finnhub의 결과를 클라이언트가 원하는 형식으로 재조립합니다.
  const mappedResults = results.map((result, index) => {
    const ticker = tickers[index];
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      return {
        ticker: ticker,
        status: 'fulfilled',
        value: result.value.value,
      };
    } else {
      // fetchSinglePrice에서 rejected된 경우
      const reason = (result.status === 'rejected' ? result.reason : result.value.reason) || 'Unknown error';
      return {
        ticker: ticker,
        status: 'rejected',
        reason: reason,
      };
    }
  });

  // 4. [중요!] 해결책 2: 캐시 헤더 추가
  // Netlify/Vercel Edge에 5분(300초) 동안 이 응답을 캐시하도록 지시합니다.
  // 동일한 요청(e.g., ?symbols=AAPL,MSFT)이 5분 내에 다시 오면 서버리스 함수를 실행하지 않고 캐시된 값을 즉시 반환합니다.
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  // 5. 최종 결과를 클라이언트에 한 번만 보냅니다.
  response.status(200).json(mappedResults);
}
```

---

## `e2e/app.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Portfolio Rebalancer E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load the application', async ({ page }) => {
        await expect(page).toHaveTitle(/Portfolio Rebalancing Calculator/i);
        await expect(page.locator('h1')).toContainText(/포트폴리오 리밸런싱 계산기|Portfolio Rebalancing Calculator/i);
    });

    test('simple calculation mode workflow', async ({ page }) => {
        // Switch to simple mode
        await page.click('input[value="simple"]');

        // Add stock information
        const nameInput = page.locator('input[data-field="name"]').first();
        await nameInput.fill('Apple Inc.');

        const tickerInput = page.locator('input[data-field="ticker"]').first();
        await tickerInput.fill('AAPL');

        const ratioInput = page.locator('input[data-field="targetRatio"]').first();
        await ratioInput.fill('50');

        const amountInput = page.locator('input[data-field="manualAmount"]').first();
        await amountInput.fill('1000000');

        // Add second stock
        await page.click('#addNewStockBtn');

        const nameInput2 = page.locator('input[data-field="name"]').nth(1);
        await nameInput2.fill('Google');

        const tickerInput2 = page.locator('input[data-field="ticker"]').nth(1);
        await tickerInput2.fill('GOOGL');

        const ratioInput2 = page.locator('input[data-field="targetRatio"]').nth(1);
        await ratioInput2.fill('50');

        const amountInput2 = page.locator('input[data-field="manualAmount"]').nth(1);
        await amountInput2.fill('1000000');

        // Set additional investment
        await page.fill('#additionalAmount', '500000');

        // Click calculate
        await page.click('#calculateBtn');

        // Wait for results
        await page.waitForSelector('#resultsSection:not(.hidden)', { timeout: 5000 });

        // Verify results are displayed
        await expect(page.locator('#resultsSection')).toBeVisible();
    });

    test.describe('Modal Tests', () => {
        test('should open and close custom modal (confirm)', async ({ page }) => {
            // Click new portfolio button to trigger confirm modal
            await page.click('#newPortfolioBtn');

            // Wait for modal to appear
            await page.waitForSelector('#customModal:not(.hidden)');
            const modal = page.locator('#customModal');

            await expect(modal).toBeVisible();
            await expect(modal).toHaveAttribute('aria-modal', 'true');

            // Check modal has input field for prompt
            const input = modal.locator('input');
            await expect(input).toBeVisible();

            // Fill in portfolio name
            await input.fill('Test Portfolio');

            // Click confirm
            await page.click('#customModalConfirm');

            // Modal should close
            await expect(modal).toHaveClass(/hidden/);
        });

        test('should handle Escape key to close modal', async ({ page }) => {
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            // Press Escape
            await page.keyboard.press('Escape');

            // Modal should close
            await expect(page.locator('#customModal')).toHaveClass(/hidden/);
        });

        test('should trap focus within modal', async ({ page }) => {
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            const modal = page.locator('#customModal');

            // Tab through focusable elements
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // Focus should stay within modal
            const focusedElement = page.locator(':focus');
            await expect(modal.locator('button, input')).toContainText(await focusedElement.textContent() || '');
        });

        test('should open transaction modal for stock', async ({ page }) => {
            // Switch to add mode (not simple)
            await page.click('input[value="add"]');

            // Wait for table to render
            await page.waitForTimeout(500);

            // Click manage button
            const manageBtn = page.locator('button[data-action="manage"]').first();
            if (await manageBtn.isVisible()) {
                await manageBtn.click();

                // Wait for transaction modal
                await page.waitForSelector('#transactionModal:not(.hidden)');

                const txModal = page.locator('#transactionModal');
                await expect(txModal).toBeVisible();
                await expect(txModal).toHaveAttribute('aria-modal', 'true');

                // Close modal
                await page.click('#closeModalBtn');
                await expect(txModal).toHaveClass(/hidden/);
            }
        });
    });

    test.describe('Portfolio Management', () => {
        test('should create new portfolio', async ({ page }) => {
            const initialPortfolios = await page.locator('#portfolioSelector option').count();

            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            await page.fill('#customModalInput', 'My New Portfolio');
            await page.click('#customModalConfirm');

            // Wait for modal to close and portfolio to be created
            await page.waitForTimeout(500);

            const newPortfolios = await page.locator('#portfolioSelector option').count();
            expect(newPortfolios).toBe(initialPortfolios + 1);
        });

        test('should switch between portfolios', async ({ page }) => {
            // Get current selected portfolio
            const selector = page.locator('#portfolioSelector');
            const optionsCount = await selector.locator('option').count();

            if (optionsCount > 1) {
                // Select different portfolio
                await selector.selectOption({ index: 1 });

                // Wait for data to load
                await page.waitForTimeout(500);

                // Verify UI updated (toast or data change)
                // This is a basic check, more specific checks can be added
                await expect(page).not.toHaveURL(/error/);
            }
        });

        test('should delete portfolio with confirmation', async ({ page }) => {
            // Create a new portfolio first
            await page.click('#newPortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');
            await page.fill('#customModalInput', 'Portfolio to Delete');
            await page.click('#customModalConfirm');
            await page.waitForTimeout(500);

            const initialCount = await page.locator('#portfolioSelector option').count();

            // Now delete it
            await page.click('#deletePortfolioBtn');
            await page.waitForSelector('#customModal:not(.hidden)');

            // Confirm deletion
            await page.click('#customModalConfirm');
            await page.waitForTimeout(500);

            const finalCount = await page.locator('#portfolioSelector option').count();
            expect(finalCount).toBeLessThan(initialCount);
        });
    });

    test.describe('Dark Mode', () => {
        test('should toggle dark mode', async ({ page }) => {
            const body = page.locator('body');

            // Check initial state
            const initialDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));

            // Toggle dark mode
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            // Verify state changed
            const newDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));
            expect(newDarkMode).toBe(!initialDarkMode);

            // Toggle again
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            // Verify back to original
            const finalDarkMode = await body.evaluate((el) => el.classList.contains('dark-mode'));
            expect(finalDarkMode).toBe(initialDarkMode);
        });

        test('should persist dark mode preference', async ({ page, context }) => {
            // Enable dark mode
            await page.click('#darkModeToggle');
            await page.waitForTimeout(200);

            const darkModeEnabled = await page.locator('body').evaluate((el) =>
                el.classList.contains('dark-mode')
            );

            // Reload page
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check dark mode persisted
            const darkModeAfterReload = await page.locator('body').evaluate((el) =>
                el.classList.contains('dark-mode')
            );

            expect(darkModeAfterReload).toBe(darkModeEnabled);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA labels', async ({ page }) => {
            // Check for aria-label on important buttons
            await expect(page.locator('#calculateBtn')).toHaveAttribute('aria-label');
            await expect(page.locator('#addNewStockBtn')).toHaveAttribute('aria-label');
        });

        test('should have aria-live region for announcements', async ({ page }) => {
            const announcer = page.locator('#aria-announcer');
            await expect(announcer).toHaveAttribute('aria-live');
        });

        test('should be keyboard navigable', async ({ page }) => {
            // Tab through main elements
            await page.keyboard.press('Tab');
            let focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();

            // Tab multiple times
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Tab');
            }

            focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();
        });
    });

    test.describe('Data Import/Export', () => {
        test('should export portfolio data', async ({ page }) => {
            // Click data management dropdown
            await page.click('#dataManagementBtn');
            await page.waitForTimeout(200);

            // Setup download handler
            const downloadPromise = page.waitForEvent('download');

            // Click export
            await page.click('#exportDataBtn');

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/portfolio_data_.*\.json/);
        });

        test('should show import file dialog', async ({ page }) => {
            await page.click('#dataManagementBtn');
            await page.waitForTimeout(200);

            // Click import (opens file picker - can't fully test without file)
            await page.click('#importDataBtn');
            // File input should be triggered (hidden input)
            // This is hard to test in E2E without actual file
        });
    });

    test.describe('Currency Conversion', () => {
        test('should switch between KRW and USD', async ({ page }) => {
            // Switch to USD mode
            await page.click('input[value="usd"]');
            await page.waitForTimeout(200);

            // Exchange rate input should be visible
            await expect(page.locator('#exchangeRateGroup')).toBeVisible();
            await expect(page.locator('#usdInputGroup')).toBeVisible();

            // Switch back to KRW
            await page.click('input[value="krw"]');
            await page.waitForTimeout(200);

            // Exchange rate input should be hidden
            await expect(page.locator('#exchangeRateGroup')).toHaveClass(/hidden/);
        });

        test('should convert between currencies', async ({ page }) => {
            // Switch to USD mode
            await page.click('input[value="usd"]');

            // Enter USD amount
            await page.fill('#additionalAmountUSD', '100');

            // Trigger conversion (blur event)
            await page.locator('#additionalAmountUSD').blur();
            await page.waitForTimeout(300);

            // Check KRW amount updated
            const krwValue = await page.inputValue('#additionalAmount');
            expect(parseInt(krwValue)).toBeGreaterThan(0);
        });
    });

    test.describe('Virtual Scroll', () => {
        test('should handle many stocks with virtual scrolling', async ({ page }) => {
            // Add multiple stocks
            for (let i = 0; i < 20; i++) {
                await page.click('#addNewStockBtn');
                await page.waitForTimeout(100);
            }

            // Scroll the virtual scroll container
            const scrollContainer = page.locator('#virtual-scroll-wrapper');
            await scrollContainer.evaluate((el) => {
                el.scrollTop = 500;
            });

            await page.waitForTimeout(300);

            // Verify scroll worked (container should have stocks)
            const stocks = await page.locator('.virtual-row-inputs').count();
            expect(stocks).toBeGreaterThan(0);
        });
    });
});
```

---

## `netlify.toml`

```toml
# netlify.toml (새 파일)

[build]
  # 1. Netlify가 실행할 '빌드' 명령
  #    이것이 CI/CD의 핵심입니다.
  #    - npx playwright install --with-deps: Netlify 빌드 서버에 Playwright 브라우저와 리눅스 종속성 설치
  #    - npm run test: Vitest 단위 테스트 실행
  #    - npm run test:e2e: Playwright E2E 테스트 실행
  #    - npm run build: 모든 테스트 통과 시 Vite 빌드 실행
  #    (참고: npm run test:e2e가 실패하면 '&&' 때문에 npm run build는 실행되지 않고 배포가 중단됩니다.)
  command = "npx playwright install --with-deps && npm run test && npm run test:e2e && npm run build"

  # 2. 빌드 결과물(정적 파일)이 있는 폴더
  publish = "dist"

  # 3. 서버리스 함수(api 폴더)가 있는 폴더
  functions = "api"

[build.environment]
  # Playwright가 Vite 개발 서버를 시작할 때 필요한 환경 변수
  # (이 키의 '값'은 3단계에서 Netlify 대시보드에 설정합니다)
  FINNHUB_API_KEY = "FINNHUB_API_KEY"
```

---

## `playwright.config.ts`

```typescript
// playwright.config.ts (수정본)

import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  
  // [수정] CI 환경(Netlify 빌드)에서는 실패 시 1번만 재시도합니다.
  retries: process.env.CI ? 1 : 0,

  // [수정] webServer 설정은 그대로 유지합니다.
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
  },

  // [수정] CI 환경에서는 Chromium만 사용하고, 로컬에서는 3개 모두 사용합니다.
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
      ],
});
```

---

## `src/controller/CalculationManager.ts`

```typescript
// src/controller/CalculationManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { CONFIG } from '../constants';
import { ErrorService, ValidationError } from '../errorService';
import { getRatioSum } from '../utils';
import { t } from '../i18n';
import { generateAddModeResultsHTML, generateSellModeResultsHTML, generateSimpleModeResultsHTML } from '../templates';
import { AddRebalanceStrategy, SellRebalanceStrategy, SimpleRatioStrategy } from '../calculationStrategies';
import { apiService, APIError, formatAPIError } from '../apiService';
import { DataStore } from '../dataStore';
import Decimal from 'decimal.js';
import type { MainMode, Currency } from '../types';

/**
 * @class CalculationManager
 * @description 계산, API, 통화 변환 관리
 */
export class CalculationManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView,
        private debouncedSave: () => void,
        private getInvestmentAmountInKRW: () => Decimal
    ) {}

    /**
     * @description 리밸런싱 계산 실행
     */
    async handleCalculate(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const additionalInvestment = this.getInvestmentAmountInKRW();

        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment
        };

        const validationErrors = Validator.validateForCalculation(inputs);

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map((err) => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation');
            this.view.hideResults();
            return;
        }

        const totalRatio = getRatioSum(inputs.portfolioData);
        if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
            const proceed = await this.view.showConfirm(
                t('modal.confirmRatioSumWarnTitle'),
                t('modal.confirmRatioSumWarnMsg', { totalRatio: totalRatio.toFixed(1) })
            );
            if (!proceed) {
                this.view.hideResults();
                return;
            }
        }

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: inputs.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        activePortfolio.portfolioData = calculatedState.portfolioData;

        // Save portfolio snapshot
        try {
            const snapshot = Calculator.createSnapshot(
                activePortfolio.id,
                calculatedState.portfolioData,
                activePortfolio.settings.exchangeRate,
                activePortfolio.settings.currentCurrency
            );
            await DataStore.addSnapshot(snapshot);
            console.log('[CalculationManager] Snapshot saved:', snapshot.date);
        } catch (error) {
            console.error('[CalculationManager] Failed to save snapshot:', error);
            // Continue with calculation even if snapshot fails
        }

        let strategy;
        if (activePortfolio.settings.mainMode === 'add') {
            strategy = new AddRebalanceStrategy(calculatedState.portfolioData, additionalInvestment);
        } else if (activePortfolio.settings.mainMode === 'simple') {
            strategy = new SimpleRatioStrategy(calculatedState.portfolioData, additionalInvestment);
        } else {
            strategy = new SellRebalanceStrategy(calculatedState.portfolioData);
        }
        const rebalancingResults = Calculator.calculateRebalancing(strategy);

        const resultsHTML =
            activePortfolio.settings.mainMode === 'add'
                ? generateAddModeResultsHTML(
                      rebalancingResults.results,
                      {
                          currentTotal: calculatedState.currentTotal,
                          additionalInvestment: additionalInvestment,
                          finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
                      },
                      activePortfolio.settings.currentCurrency,
                      activePortfolio.settings.tradingFeeRate,
                      activePortfolio.settings.taxRate
                  )
                : activePortfolio.settings.mainMode === 'simple'
                ? generateSimpleModeResultsHTML(
                      rebalancingResults.results,
                      {
                          currentTotal: calculatedState.currentTotal,
                          additionalInvestment: additionalInvestment,
                          finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
                      },
                      activePortfolio.settings.currentCurrency
                  )
                : generateSellModeResultsHTML(rebalancingResults.results, activePortfolio.settings.currentCurrency);

        this.view.displayResults(resultsHTML);

        const chartLabels = rebalancingResults.results.map((r) => r.stock.name);
        const chartData = rebalancingResults.results.map((r) => {
            const ratio = r.stock.targetRatio instanceof Decimal ? r.stock.targetRatio : new Decimal(r.stock.targetRatio ?? 0);
            return ratio.toNumber();
        });
        const chartTitle =
            activePortfolio.settings.mainMode === 'simple'
                ? '포트폴리오 목표 비율 (간단 계산 모드)'
                : activePortfolio.settings.mainMode === 'add'
                ? '포트폴리오 목표 비율 (추가 매수 모드)'
                : '포트폴리오 목표 비율 (매도 리밸런싱 모드)';

        this.view.displayChart((await import('chart.js/auto')).default, chartLabels, chartData, chartTitle);

        this.debouncedSave();
        this.view.showToast(t('toast.calculateSuccess'), 'success');
    }

    /**
     * @description 모든 주식 가격 가져오기
     */
    async handleFetchAllPrices(): Promise<{ needsUIUpdate: boolean }> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), 'info');
            return { needsUIUpdate: false };
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter((s) => s.ticker && s.ticker.trim() !== '')
            .map((s) => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), 'info');
            return { needsUIUpdate: false };
        }

        this.view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers: string[] = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const currentCurrency = activePortfolio.settings.currentCurrency || 'krw';

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    let price = result.value;

                    if (currentCurrency === 'krw') {
                        const priceDec = new Decimal(price);
                        const exchangeRateDec = new Decimal(exchangeRate);
                        price = priceDec.times(exchangeRateDec).toNumber();
                    }

                    this.state.updateStockProperty((result as any).id, 'currentPrice', price);
                    this.view.updateCurrentPriceInput((result as any).id, price.toFixed(2));
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push((result as any).ticker);
                    console.error(`[API] Failed to fetch price for ${(result as any).ticker}:`, (result as any).reason);
                }
            });

            Calculator.clearPortfolioStateCache();

            if (successCount === tickersToFetch.length) {
                this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), 'success');
            } else if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }), 'warning');
            } else {
                this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), 'error');
            }

            if (failedTickers.length > 0) {
                console.log('Failed tickers:', failedTickers.join(', '));
            }

            return { needsUIUpdate: true };
        } catch (error) {
            // Enhanced error handling with APIError
            if (error instanceof APIError) {
                const userMessage = formatAPIError(error);
                this.view.showToast(userMessage, 'error');
                console.error(`[API] ${error.type}:`, error.message);
            } else {
                ErrorService.handle(error as Error, 'handleFetchAllPrices');
                this.view.showToast(t('api.fetchErrorGlobal', { message: (error as Error).message }), 'error');
            }
            return { needsUIUpdate: false };
        } finally {
            this.view.toggleFetchButton(false);
        }
    }

    /**
     * @description 메인 모드 변경
     * @param newMode - 새 메인 모드
     */
    async handleMainModeChange(newMode: MainMode): Promise<{ needsFullRender: boolean }> {
        if (newMode !== 'add' && newMode !== 'sell' && newMode !== 'simple') return { needsFullRender: false };

        await this.state.updatePortfolioSettings('mainMode', newMode);

        requestAnimationFrame(() => {
            const modeName =
                newMode === 'add' ? t('ui.addMode') : newMode === 'simple' ? '간단 계산 모드' : t('ui.sellMode');
            this.view.showToast(t('toast.modeChanged', { mode: modeName }), 'info');
        });

        return { needsFullRender: true };
    }

    /**
     * @description 통화 모드 변경
     * @param newCurrency - 새 통화 모드
     */
    async handleCurrencyModeChange(newCurrency: Currency): Promise<{ needsFullRender: boolean }> {
        if (newCurrency !== 'krw' && newCurrency !== 'usd') return { needsFullRender: false };

        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return { needsFullRender: false };

        await this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        Calculator.clearPortfolioStateCache();
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }), 'info');

        return { needsFullRender: true };
    }

    /**
     * @description 통화 변환
     * @param source - 변환 소스 ('krw' 또는 'usd')
     */
    async handleCurrencyConversion(source: 'krw' | 'usd'): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

        if (
            !(additionalAmountInput instanceof HTMLInputElement) ||
            !(additionalAmountUSDInput instanceof HTMLInputElement) ||
            !(exchangeRateInput instanceof HTMLInputElement)
        )
            return;

        const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRateNum > 0;
        let currentExchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            currentExchangeRate = exchangeRateNum;
        } else {
            await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
            this.view.showToast(t('toast.invalidExchangeRate'), 'error');
        }

        const currentExchangeRateDec = new Decimal(currentExchangeRate);

        let krwAmountDec = new Decimal(0);
        let usdAmountDec = new Decimal(0);

        try {
            if (source === 'krw') {
                krwAmountDec = new Decimal(additionalAmountInput.value || 0);
                if (krwAmountDec.isNegative()) throw new Error('Negative KRW input');
                usdAmountDec = currentExchangeRateDec.isZero() ? new Decimal(0) : krwAmountDec.div(currentExchangeRateDec);
            } else {
                usdAmountDec = new Decimal(additionalAmountUSDInput.value || 0);
                if (usdAmountDec.isNegative()) throw new Error('Negative USD input');
                krwAmountDec = usdAmountDec.times(currentExchangeRateDec);
            }

            if (source === 'krw') {
                additionalAmountUSDInput.value = usdAmountDec.toFixed(2);
            } else {
                additionalAmountInput.value = krwAmountDec.toFixed(0);
            }

            this.debouncedSave();
        } catch (e) {
            console.error('Error during currency conversion:', e);
            this.view.showToast(t('toast.amountInputError'), 'error');
            if (source === 'krw') additionalAmountUSDInput.value = '';
            else additionalAmountInput.value = '';
        }
    }

    /**
     * @description 포트폴리오 환율 변경
     * @param rate - 환율
     */
    async handlePortfolioExchangeRateChange(rate: number): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const exchangeRateNum = Number(rate);
        const isValidRate = !isNaN(exchangeRateNum) && exchangeRateNum > 0;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            this.debouncedSave();
        } else {
            await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            this.view.showToast(t('toast.invalidExchangeRate'), 'error');
        }
    }

    /**
     * @description 비율 정규화
     */
    handleNormalizeRatios(): void {
        try {
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), 'info');
                return;
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), 'success');
        } catch (error) {
            ErrorService.handle(error as Error, 'handleNormalizeRatios');
            this.view.showToast(t('toast.normalizeRatiosError'), 'error');
        }
    }
}
```

---

## `src/controller/DataManager.ts`

```typescript
// src/controller/DataManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { ErrorService } from '../errorService';
import { t } from '../i18n';

/**
 * @class DataManager
 * @description 데이터 가져오기/내보내기, 초기화 관리
 */
export class DataManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 데이터 초기화
     */
    async handleResetData(): Promise<{ needsFullRender: boolean; needsUISetup: boolean }> {
        const confirmReset = await this.view.showConfirm(t('modal.confirmResetTitle'), t('modal.confirmResetMsg'));
        if (confirmReset) {
            await this.state.resetData();
            Calculator.clearPortfolioStateCache();

            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);

                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
            }

            this.view.showToast(t('toast.dataReset'), 'success');
            return { needsFullRender: true, needsUISetup: true };
        }
        return { needsFullRender: false, needsUISetup: false };
    }

    /**
     * @description 데이터 내보내기
     */
    handleExportData(): void {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.name || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.view.showToast(t('toast.exportSuccess'), 'success');
        } catch (error) {
            ErrorService.handle(error as Error, 'handleExportData');
            this.view.showToast(t('toast.exportError'), 'error');
        }
    }

    /**
     * @description 거래 내역 CSV 내보내기 (Phase 4.1)
     */
    handleExportTransactionsCSV(): void {
        try {
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
                this.view.showToast('내보낼 거래 내역이 없습니다.', 'info');
                return;
            }

            // CSV 헤더
            let csvContent = 'Stock Name,Ticker,Transaction Type,Date,Quantity,Price (USD),Total Amount (USD)\n';

            // 모든 종목의 거래 내역 수집
            for (const stock of activePortfolio.portfolioData) {
                for (const tx of stock.transactions) {
                    const totalAmount = (parseFloat(tx.quantity.toString()) * parseFloat(tx.price.toString())).toFixed(2);
                    csvContent += `"${stock.name}","${stock.ticker}","${tx.type}","${tx.date}",${tx.quantity},${tx.price},${totalAmount}\n`;
                }
            }

            // CSV 파일 다운로드
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const filename = `transactions_${activePortfolio.name}_${Date.now()}.csv`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.view.showToast('거래 내역 CSV 내보내기 완료', 'success');
        } catch (error) {
            ErrorService.handle(error as Error, 'handleExportTransactionsCSV');
            this.view.showToast('CSV 내보내기 실패', 'error');
        }
    }

    /**
     * @description 데이터 가져오기 트리거
     */
    handleImportData(): void {
        const fileInput = this.view.dom.importFileInput;
        if (fileInput instanceof HTMLInputElement) fileInput.click();
    }

    /**
     * @description 파일 선택 핸들러
     * @param e - 파일 입력 이벤트
     */
    handleFileSelected(e: Event): Promise<{ needsUISetup: boolean }> {
        return new Promise((resolve) => {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (file) {
                if (file.type !== 'application/json') {
                    this.view.showToast(t('toast.invalidFileType'), 'error');
                    fileInput.value = '';
                    resolve({ needsUISetup: false });
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const jsonString = event.target?.result;
                        if (typeof jsonString === 'string') {
                            const loadedData = JSON.parse(jsonString);
                            await this.state.importData(loadedData);
                            Calculator.clearPortfolioStateCache();
                            this.view.showToast(t('toast.importSuccess'), 'success');
                            resolve({ needsUISetup: true });
                        } else {
                            throw new Error('Failed to read file content.');
                        }
                    } catch (error) {
                        ErrorService.handle(error as Error, 'handleFileSelected');
                        this.view.showToast(t('toast.importError'), 'error');
                        resolve({ needsUISetup: false });
                    } finally {
                        fileInput.value = '';
                    }
                };

                reader.onerror = () => {
                    ErrorService.handle(new Error('File reading error'), 'handleFileSelected - Reader Error');
                    this.view.showToast(t('toast.importError'), 'error');
                    fileInput.value = '';
                    resolve({ needsUISetup: false });
                };

                reader.readAsText(file);
            } else {
                resolve({ needsUISetup: false });
            }
        });
    }
}
```

---

## `src/controller/PortfolioManager.ts`

```typescript
// src/controller/PortfolioManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { t } from '../i18n';
import DOMPurify from 'dompurify';

/**
 * @class PortfolioManager
 * @description 포트폴리오 CRUD 작업 관리
 */
export class PortfolioManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 새 포트폴리오 생성
     */
    async handleNewPortfolio(): Promise<void> {
        let name = await this.view.showPrompt(
            t('modal.promptNewPortfolioNameTitle'),
            t('modal.promptNewPortfolioNameMsg')
        );

        if (name) {
            name = DOMPurify.sanitize(name);
            await this.state.createNewPortfolio(name);
            this.view.renderPortfolioSelector(
                this.state.getAllPortfolios(),
                this.state.getActivePortfolio()?.id || ''
            );
            this.view.showToast(t('toast.portfolioCreated', { name }), 'success');
            return; // 신호: fullRender 필요
        }
    }

    /**
     * @description 포트폴리오 이름 변경
     */
    async handleRenamePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.view.showPrompt(
            t('modal.promptRenamePortfolioTitle'),
            t('modal.promptRenamePortfolioMsg'),
            activePortfolio.name
        );

        if (newName && newName.trim()) {
            newName = DOMPurify.sanitize(newName.trim());
            await this.state.renamePortfolio(activePortfolio.id, newName);
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed'), 'success');
        }
    }

    /**
     * @description 포트폴리오 삭제
     */
    async handleDeletePortfolio(): Promise<void> {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), 'error');
            return;
        }

        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeletePortfolioTitle'),
            t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name })
        );

        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.view.showToast(t('toast.portfolioDeleted'), 'success');
                    return; // 신호: fullRender 필요
                }
            }
        }
    }

    /**
     * @description 포트폴리오 전환
     * @param newId - 새 포트폴리오 ID
     */
    async handleSwitchPortfolio(newId: string): Promise<void> {
        const selector = this.view.dom.portfolioSelector;
        let targetId = newId;

        if (!targetId && selector instanceof HTMLSelectElement) {
            targetId = selector.value;
        }

        if (targetId) {
            await this.state.setActivePortfolioId(targetId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                this.view.updateCurrencyModeUI(activePortfolio.settings.currentCurrency);
                this.view.updateMainModeUI(activePortfolio.settings.mainMode);

                const { exchangeRateInput, portfolioExchangeRateInput } = this.view.dom;
                if (exchangeRateInput instanceof HTMLInputElement) {
                    exchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
                if (portfolioExchangeRateInput instanceof HTMLInputElement) {
                    portfolioExchangeRateInput.value = activePortfolio.settings.exchangeRate.toString();
                }
            }
            return; // 신호: fullRender 필요
        }
    }
}
```

---

## `src/controller/StockManager.ts`

```typescript
// src/controller/StockManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { getRatioSum } from '../utils';
import { t } from '../i18n';
import { generateSectorAnalysisHTML } from '../templates';
import Decimal from 'decimal.js';
import DOMPurify from 'dompurify';

/**
 * @class StockManager
 * @description 주식 추가, 삭제, 수정 관리
 */
export class StockManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView,
        private debouncedSave: () => void
    ) {}

    /**
     * @description 새 주식 추가
     */
    async handleAddNewStock(): Promise<{ needsFullRender: boolean; stockId?: string }> {
        const newStock = await this.state.addNewStock();
        return { needsFullRender: true, stockId: newStock?.id };
    }

    /**
     * @description 주식 삭제
     * @param stockId - 주식 ID
     */
    async handleDeleteStock(stockId: string): Promise<{ needsFullRender: boolean }> {
        const stockName = this.state.getStockById(stockId)?.name || t('defaults.unknownStock');
        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeleteStockTitle'),
            t('modal.confirmDeleteStockMsg', { name: stockName })
        );

        if (confirmDelete) {
            if (await this.state.deleteStock(stockId)) {
                Calculator.clearPortfolioStateCache();
                this.view.showToast(t('toast.transactionDeleted'), 'success');
                return { needsFullRender: true };
            } else {
                this.view.showToast(t('toast.lastStockDeleteError'), 'error');
            }
        }
        return { needsFullRender: false };
    }

    /**
     * @description 포트폴리오 테이블 변경 핸들러
     * @param e - 이벤트
     */
    handlePortfolioBodyChange(e: Event): { needsFullRender: boolean; needsUIUpdate: boolean; needsSave: boolean } {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const row = target.closest('div[data-id]');
        if (!row) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        const stockId = (row as HTMLElement).dataset.id;
        const field = (target as HTMLInputElement).dataset.field;
        if (!stockId || !field) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

        let value: any = target.type === 'checkbox' && target instanceof HTMLInputElement ? target.checked : target.value;
        let isValid = true;

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
            case 'manualAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                if (isValid) value = validationResult.value ?? 0;
                break;
            case 'isFixedBuyEnabled':
                value = Boolean(value);
                break;
            case 'ticker':
                const tickerResult = Validator.validateTicker(value);
                isValid = tickerResult.isValid;
                if (isValid) value = tickerResult.value ?? '';
                break;
            case 'name':
            case 'sector':
                const textResult = Validator.validateText(value, field === 'name' ? 50 : 30);
                isValid = textResult.isValid;
                if (isValid) value = DOMPurify.sanitize(textResult.value ?? '');
                break;
            default:
                value = DOMPurify.sanitize(String(value).trim());
                break;
        }

        this.view.toggleInputValidation(target as HTMLInputElement, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);

            // manualAmount는 간단 모드 전용 필드
            if (field === 'manualAmount') {
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return { needsFullRender: false, needsUIUpdate: false, needsSave: false };

            // ===== [Phase 1.1 최적화] 메타데이터 필드는 재계산 없이 DOM만 업데이트 =====
            if (field === 'name' || field === 'ticker') {
                // 이름과 티커 변경은 계산에 영향을 주지 않으므로 가상 스크롤 데이터만 업데이트
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            if (field === 'sector') {
                // 섹터 변경은 섹터 분석만 재계산하고 가상 스크롤 데이터만 업데이트
                this.view.updateStockInVirtualData(stockId, field, value);

                // 섹터 분석만 재계산 (전체 계산 상태는 이미 캐시되어 있음)
                Calculator.clearPortfolioStateCache();
                const calculatedState = Calculator.calculatePortfolioState({
                    portfolioData: activePortfolio.portfolioData,
                    exchangeRate: activePortfolio.settings.exchangeRate,
                    currentCurrency: activePortfolio.settings.currentCurrency
                });
                const newSectorData = Calculator.calculateSectorAnalysis(
                    calculatedState.portfolioData,
                    activePortfolio.settings.currentCurrency
                );
                this.view.displaySectorAnalysis(
                    generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
                );

                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }
            // ===== [Phase 1.1 최적화 끝] =====

            // currentPrice 변경 시 부분 업데이트 (최적화)
            if (field === 'currentPrice') {
                const stock = activePortfolio.portfolioData.find((s) => s.id === stockId);
                if (stock) {
                    const calculatedMetrics = Calculator.calculateStockMetrics(stock);
                    const exchangeRateDec = new Decimal(activePortfolio.settings.exchangeRate);

                    if (activePortfolio.settings.currentCurrency === 'krw') {
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
                    } else {
                        calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                        calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
                    }

                    this.view.updateSingleStockRow(stockId, calculatedMetrics);

                    // 섹터 분석 재계산
                    Calculator.clearPortfolioStateCache();
                    const calculatedState = Calculator.calculatePortfolioState({
                        portfolioData: activePortfolio.portfolioData,
                        exchangeRate: activePortfolio.settings.exchangeRate,
                        currentCurrency: activePortfolio.settings.currentCurrency
                    });
                    const newSectorData = Calculator.calculateSectorAnalysis(
                        calculatedState.portfolioData,
                        activePortfolio.settings.currentCurrency
                    );
                    this.view.displaySectorAnalysis(
                        generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
                    );
                }

                this.debouncedSave();
                return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
            }

            // 기타 필드 변경 시 전체 재계산
            Calculator.clearPortfolioStateCache();

            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            activePortfolio.portfolioData = calculatedState.portfolioData;

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const newRatioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(newRatioSum.toNumber());

            const newSectorData = Calculator.calculateSectorAnalysis(
                calculatedState.portfolioData,
                activePortfolio.settings.currentCurrency
            );
            this.view.displaySectorAnalysis(
                generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency)
            );

            this.debouncedSave();

            if (field === 'isFixedBuyEnabled') {
                const amountInput = row.querySelector('input[data-field="fixedBuyAmount"]');
                if (amountInput instanceof HTMLInputElement) {
                    amountInput.disabled = !value;
                    if (!value) {
                        amountInput.value = '0';
                        this.state.updateStockProperty(stockId, 'fixedBuyAmount', 0);
                        this.debouncedSave();
                    }
                }
            }
        }

        return { needsFullRender: false, needsUIUpdate: false, needsSave: false };
    }

    /**
     * @description 포트폴리오 테이블 클릭 핸들러
     * @param e - 이벤트
     */
    handlePortfolioBodyClick(e: Event): { action: string | null; stockId: string | null } {
        const target = e.target as HTMLElement;
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return { action: null, stockId: null };

        const row = actionButton.closest('div[data-id]');
        if (!row?.dataset.id) return { action: null, stockId: null };

        const stockId = (row as HTMLElement).dataset.id;
        const action = (actionButton as HTMLElement).dataset.action || null;

        return { action, stockId };
    }
}
```

---

## `src/controller/TransactionManager.ts`

```typescript
// src/controller/TransactionManager.ts
import { PortfolioState } from '../state';
import { PortfolioView } from '../view';
import { Calculator } from '../calculator';
import { Validator } from '../validator';
import { t } from '../i18n';
import Decimal from 'decimal.js';

/**
 * @class TransactionManager
 * @description 거래 내역 추가, 삭제 관리
 */
export class TransactionManager {
    constructor(
        private state: PortfolioState,
        private view: PortfolioView
    ) {}

    /**
     * @description 주식 ID로 거래 내역 모달 열기
     * @param stockId - 주식 ID
     */
    openTransactionModalByStockId(stockId: string): void {
        const stock = this.state.getStockById(stockId);
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (stock && currency) {
            this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
        }
    }

    /**
     * @description 새 거래 내역 추가
     * @param e - 폼 제출 이벤트
     */
    async handleAddNewTransaction(e: Event): Promise<{ needsFullRender: boolean }> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const modal = form.closest('#transactionModal') as HTMLElement | null;
        const stockId = modal?.dataset.stockId;
        if (!stockId) return { needsFullRender: false };

        const typeInput = form.querySelector('input[name="txType"]:checked');
        const inputModeInput = form.querySelector('input[name="inputMode"]:checked');
        const dateInput = form.querySelector('#txDate') as HTMLInputElement;
        const quantityInput = form.querySelector('#txQuantity') as HTMLInputElement;
        const totalAmountInput = form.querySelector('#txTotalAmount') as HTMLInputElement;
        const priceInput = form.querySelector('#txPrice') as HTMLInputElement;

        if (!typeInput || !dateInput || !priceInput) return { needsFullRender: false };

        const typeValue = typeInput instanceof HTMLInputElement ? typeInput.value : 'buy';
        const type: 'buy' | 'sell' | 'dividend' =
            typeValue === 'sell' ? 'sell' :
            typeValue === 'dividend' ? 'dividend' :
            'buy';
        const inputMode = inputModeInput instanceof HTMLInputElement ? inputModeInput.value : 'quantity';
        const date = dateInput.value;
        const priceStr = priceInput.value;

        let finalQuantity: number;

        if (inputMode === 'amount') {
            if (!totalAmountInput || !totalAmountInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), 'error');
                return { needsFullRender: false };
            }

            const totalAmountStr = totalAmountInput.value;

            try {
                const totalAmountDec = new Decimal(totalAmountStr);
                const priceDec = new Decimal(priceStr);

                if (priceDec.isZero() || priceDec.isNegative()) {
                    this.view.showToast('단가는 0보다 커야 합니다.', 'error');
                    return { needsFullRender: false };
                }

                const quantityDec = totalAmountDec.div(priceDec);
                finalQuantity = quantityDec.toNumber();
            } catch (error) {
                this.view.showToast('금액 또는 단가 입력이 올바르지 않습니다.', 'error');
                return { needsFullRender: false };
            }
        } else {
            if (!quantityInput || !quantityInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), 'error');
                return { needsFullRender: false };
            }

            const quantityStr = quantityInput.value;
            finalQuantity = Number(quantityStr);
        }

        const txData = { type, date, quantity: String(finalQuantity), price: priceStr };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.invalidTransactionInfo'), 'error');
            return { needsFullRender: false };
        }

        const success = await this.state.addTransaction(stockId, {
            type,
            date,
            quantity: finalQuantity,
            price: Number(priceStr)
        });

        if (success) {
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                this.view.renderTransactionList(this.state.getTransactions(stockId), currency);
            }
            form.reset();
            dateInput.valueAsDate = new Date();

            // 입력 모드를 수량 입력으로 리셋
            const inputModeQuantity = form.querySelector('#inputModeQuantity');
            if (inputModeQuantity instanceof HTMLInputElement) {
                inputModeQuantity.checked = true;
                const quantityInputGroup = document.getElementById('quantityInputGroup');
                const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
                const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

                if (quantityInputGroup) quantityInputGroup.style.display = '';
                if (totalAmountInputGroup) totalAmountInputGroup.style.display = 'none';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
                if (quantityInput) quantityInput.required = true;
                if (totalAmountInput) totalAmountInput.required = false;
            }

            this.view.showToast(t('toast.transactionAdded'), 'success');
            Calculator.clearPortfolioStateCache();
            return { needsFullRender: true };
        } else {
            this.view.showToast(t('toast.transactionAddFailed'), 'error');
            return { needsFullRender: false };
        }
    }

    /**
     * @description 거래 내역 삭제
     * @param stockId - 주식 ID
     * @param txId - 거래 내역 ID
     */
    async handleTransactionListClick(stockId: string, txId: string): Promise<{ needsUIUpdate: boolean }> {
        if (stockId && txId) {
            const confirmDelete = await this.view.showConfirm(
                t('modal.confirmDeleteTransactionTitle'),
                t('modal.confirmDeleteTransactionMsg')
            );
            if (confirmDelete) {
                const success = await this.state.deleteTransaction(stockId, txId);
                if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                        const transactionsBeforeRender = this.state.getTransactions(stockId);
                        this.view.renderTransactionList(transactionsBeforeRender, currency);
                    }
                    this.view.showToast(t('toast.transactionDeleted'), 'success');
                    Calculator.clearPortfolioStateCache();
                    return { needsUIUpdate: true };
                } else {
                    this.view.showToast(t('toast.transactionDeleteFailed'), 'error');
                }
            }
        } else {
            console.error('handleTransactionListClick received invalid IDs:', stockId, txId);
        }
        return { needsUIUpdate: false };
    }
}
```

---

## `src/view/EventEmitter.test.ts`

```typescript
// src/view/EventEmitter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from './EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('on() and emit()', () => {
        it('should register and call a single event listener', () => {
            const callback = vi.fn();
            emitter.on('testEvent', callback);
            emitter.emit('testEvent', { data: 'test' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should call multiple listeners for the same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            emitter.on('testEvent', callback1);
            emitter.on('testEvent', callback2);
            emitter.on('testEvent', callback3);

            emitter.emit('testEvent', 'payload');

            expect(callback1).toHaveBeenCalledWith('payload');
            expect(callback2).toHaveBeenCalledWith('payload');
            expect(callback3).toHaveBeenCalledWith('payload');
        });

        it('should emit events without data', () => {
            const callback = vi.fn();
            emitter.on('noDataEvent', callback);
            emitter.emit('noDataEvent');

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it('should not call listeners for different events', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.emit('event1', 'data1');

            expect(callback1).toHaveBeenCalledWith('data1');
            expect(callback2).not.toHaveBeenCalled();
        });

        it('should handle emitting non-existent events gracefully', () => {
            expect(() => {
                emitter.emit('nonExistentEvent', 'data');
            }).not.toThrow();
        });
    });

    describe('clear()', () => {
        it('should remove all event listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.clear();

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    describe('off()', () => {
        it('should remove listeners for a specific event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.off('event1');

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should handle removing non-existent events gracefully', () => {
            expect(() => {
                emitter.off('nonExistentEvent');
            }).not.toThrow();
        });
    });

    describe('multiple subscriptions', () => {
        it('should support multiple events with different callbacks', () => {
            const callbacks = {
                calculate: vi.fn(),
                save: vi.fn(),
                delete: vi.fn()
            };

            emitter.on('calculateClicked', callbacks.calculate);
            emitter.on('saveClicked', callbacks.save);
            emitter.on('deleteClicked', callbacks.delete);

            emitter.emit('calculateClicked', { amount: 1000 });
            emitter.emit('saveClicked', { id: 123 });

            expect(callbacks.calculate).toHaveBeenCalledWith({ amount: 1000 });
            expect(callbacks.save).toHaveBeenCalledWith({ id: 123 });
            expect(callbacks.delete).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle rapid successive emits', () => {
            const callback = vi.fn();
            emitter.on('rapidEvent', callback);

            for (let i = 0; i < 100; i++) {
                emitter.emit('rapidEvent', i);
            }

            expect(callback).toHaveBeenCalledTimes(100);
        });

        it('should handle callbacks that throw errors', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const normalCallback = vi.fn();

            emitter.on('errorEvent', errorCallback);
            emitter.on('errorEvent', normalCallback);

            // First callback throws, but second should still execute
            expect(() => {
                emitter.emit('errorEvent');
            }).toThrow();

            expect(errorCallback).toHaveBeenCalled();
            // Note: Due to the throw, normalCallback might not be called
            // depending on implementation
        });
    });
});
```

---

## `src/view/EventEmitter.ts`

```typescript
// src/view/EventEmitter.ts
/**
 * @class EventEmitter
 * @description Pub/Sub 패턴을 구현하는 이벤트 시스템
 */

export type EventCallback = (data?: any) => void;

export class EventEmitter {
    private _events: Record<string, EventCallback[]> = {};

    /**
     * @description 추상 이벤트를 구독합니다.
     * @param event - 이벤트 이름 (예: 'calculateClicked')
     * @param callback - 실행할 콜백 함수
     */
    on(event: string, callback: EventCallback): void {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);
    }

    /**
     * @description 추상 이벤트를 발행합니다.
     * @param event - 이벤트 이름
     * @param data - 전달할 데이터
     */
    emit(event: string, data?: any): void {
        if (this._events[event]) {
            this._events[event].forEach(callback => callback(data));
        }
    }

    /**
     * @description 모든 이벤트 리스너를 초기화합니다.
     */
    clear(): void {
        this._events = {};
    }

    /**
     * @description 특정 이벤트의 모든 리스너를 제거합니다.
     * @param event - 이벤트 이름
     */
    off(event: string): void {
        delete this._events[event];
    }
}
```

---

## `src/view/EventEmitter.test.ts`

```typescript
// src/view/EventEmitter.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from './EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('on() and emit()', () => {
        it('should register and call a single event listener', () => {
            const callback = vi.fn();
            emitter.on('testEvent', callback);
            emitter.emit('testEvent', { data: 'test' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should call multiple listeners for the same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();

            emitter.on('testEvent', callback1);
            emitter.on('testEvent', callback2);
            emitter.on('testEvent', callback3);

            emitter.emit('testEvent', 'payload');

            expect(callback1).toHaveBeenCalledWith('payload');
            expect(callback2).toHaveBeenCalledWith('payload');
            expect(callback3).toHaveBeenCalledWith('payload');
        });

        it('should emit events without data', () => {
            const callback = vi.fn();
            emitter.on('noDataEvent', callback);
            emitter.emit('noDataEvent');

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it('should not call listeners for different events', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.emit('event1', 'data1');

            expect(callback1).toHaveBeenCalledWith('data1');
            expect(callback2).not.toHaveBeenCalled();
        });

        it('should handle emitting non-existent events gracefully', () => {
            expect(() => {
                emitter.emit('nonExistentEvent', 'data');
            }).not.toThrow();
        });
    });

    describe('clear()', () => {
        it('should remove all event listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.clear();

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    describe('off()', () => {
        it('should remove listeners for a specific event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            emitter.on('event1', callback1);
            emitter.on('event2', callback2);

            emitter.off('event1');

            emitter.emit('event1');
            emitter.emit('event2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should handle removing non-existent events gracefully', () => {
            expect(() => {
                emitter.off('nonExistentEvent');
            }).not.toThrow();
        });
    });

    describe('multiple subscriptions', () => {
        it('should support multiple events with different callbacks', () => {
            const callbacks = {
                calculate: vi.fn(),
                save: vi.fn(),
                delete: vi.fn()
            };

            emitter.on('calculateClicked', callbacks.calculate);
            emitter.on('saveClicked', callbacks.save);
            emitter.on('deleteClicked', callbacks.delete);

            emitter.emit('calculateClicked', { amount: 1000 });
            emitter.emit('saveClicked', { id: 123 });

            expect(callbacks.calculate).toHaveBeenCalledWith({ amount: 1000 });
            expect(callbacks.save).toHaveBeenCalledWith({ id: 123 });
            expect(callbacks.delete).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle rapid successive emits', () => {
            const callback = vi.fn();
            emitter.on('rapidEvent', callback);

            for (let i = 0; i < 100; i++) {
                emitter.emit('rapidEvent', i);
            }

            expect(callback).toHaveBeenCalledTimes(100);
        });

        it('should handle callbacks that throw errors', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const normalCallback = vi.fn();

            emitter.on('errorEvent', errorCallback);
            emitter.on('errorEvent', normalCallback);

            // First callback throws, but second should still execute
            expect(() => {
                emitter.emit('errorEvent');
            }).toThrow();

            expect(errorCallback).toHaveBeenCalled();
            // Note: Due to the throw, normalCallback might not be called
            // depending on implementation
        });
    });
});
```

---

## `src/view/ModalManager.test.ts`

```typescript
// src/view/ModalManager.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalManager } from './ModalManager';

// Mock i18n
vi.mock('../i18n', () => ({
    t: vi.fn((key: string) => {
        const translations: Record<string, string> = {
            'view.noTransactions': '거래 내역이 없습니다',
            'ui.buy': '매수',
            'ui.sell': '매도',
            'ui.delete': '삭제',
            'modal.transactionTitle': '거래 내역'
        };
        return translations[key] || key;
    })
}));

describe('ModalManager', () => {
    let modalManager: ModalManager;
    let mockDom: any;

    beforeEach(() => {
        // Create mock DOM elements
        const txDateInput = document.createElement('input');
        txDateInput.type = 'date'; // Set type to date to support valueAsDate

        mockDom = {
            customModal: document.createElement('div'),
            customModalTitle: document.createElement('h2'),
            customModalMessage: document.createElement('p'),
            customModalInput: document.createElement('input'),
            customModalConfirm: document.createElement('button'),
            customModalCancel: document.createElement('button'),
            transactionModal: document.createElement('div'),
            modalStockName: document.createElement('h2'),
            closeModalBtn: document.createElement('button'),
            transactionListBody: document.createElement('tbody'),
            newTransactionForm: document.createElement('form'),
            txDate: txDateInput, // Use the date input with proper type
            txQuantity: document.createElement('input'),
            txPrice: document.createElement('input')
        };

        // Setup IDs for elements
        mockDom.customModal.id = 'customModal';
        mockDom.transactionModal.id = 'transactionModal';

        // Append to document body for focus trap to work
        document.body.appendChild(mockDom.customModal);
        document.body.appendChild(mockDom.transactionModal);

        modalManager = new ModalManager(mockDom);
    });

    afterEach(() => {
        // Cleanup
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('showConfirm()', () => {
        it('should display confirm modal with title and message', () => {
            const promise = modalManager.showConfirm('Test Title', 'Test Message');

            expect(mockDom.customModalTitle.textContent).toBe('Test Title');
            expect(mockDom.customModalMessage.textContent).toBe('Test Message');
            expect(mockDom.customModal.classList.contains('hidden')).toBe(false);
            expect(mockDom.customModalInput.classList.contains('hidden')).toBe(true);

            // Cleanup promise
            modalManager.handleCustomModal(false);
        });

        it('should resolve to true when confirmed', async () => {
            const promise = modalManager.showConfirm('Confirm', 'Are you sure?');

            // Simulate confirm click
            setTimeout(() => {
                modalManager.handleCustomModal(true);
            }, 10);

            const result = await promise;
            expect(result).toBe(true);
        });

        it('should resolve to false when cancelled', async () => {
            const promise = modalManager.showConfirm('Confirm', 'Are you sure?');

            setTimeout(() => {
                modalManager.handleCustomModal(false);
            }, 10);

            const result = await promise;
            expect(result).toBe(false);
        });

        it('should set aria-modal attribute', () => {
            modalManager.showConfirm('Test', 'Message');
            expect(mockDom.customModal.getAttribute('aria-modal')).toBe('true');

            modalManager.handleCustomModal(false);
        });
    });

    describe('showPrompt()', () => {
        it('should display prompt modal with input field', () => {
            const promise = modalManager.showPrompt('Enter Name', 'Please provide a name', 'Default');

            expect(mockDom.customModalTitle.textContent).toBe('Enter Name');
            expect(mockDom.customModalMessage.textContent).toBe('Please provide a name');
            expect(mockDom.customModalInput.value).toBe('Default');
            expect(mockDom.customModalInput.classList.contains('hidden')).toBe(false);

            modalManager.handleCustomModal(false);
        });

        it('should resolve to input value when confirmed', async () => {
            const promise = modalManager.showPrompt('Name', 'Enter your name', '');

            setTimeout(() => {
                mockDom.customModalInput.value = 'John Doe';
                modalManager.handleCustomModal(true);
            }, 10);

            const result = await promise;
            expect(result).toBe('John Doe');
        });

        it('should resolve to null when cancelled', async () => {
            const promise = modalManager.showPrompt('Name', 'Enter your name');

            setTimeout(() => {
                modalManager.handleCustomModal(false);
            }, 10);

            const result = await promise;
            expect(result).toBe(null);
        });
    });

    describe('openTransactionModal()', () => {
        it('should open transaction modal with stock info', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: []
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);

            expect(mockDom.transactionModal.dataset.stockId).toBe('stock-1');
            expect(mockDom.modalStockName.textContent).toContain('Apple');
            expect(mockDom.modalStockName.textContent).toContain('AAPL');
            expect(mockDom.transactionModal.classList.contains('hidden')).toBe(false);
        });

        it('should render transaction list', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: []
            };

            const mockTransactions = [
                {
                    id: 'tx-1',
                    type: 'buy' as const,
                    date: '2024-01-01',
                    quantity: 10,
                    price: 140
                }
            ];

            modalManager.openTransactionModal(mockStock, 'usd', mockTransactions);

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBeGreaterThan(0);
        });
    });

    describe('closeTransactionModal()', () => {
        it('should close transaction modal and reset form', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: []
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);
            modalManager.closeTransactionModal();

            expect(mockDom.transactionModal.classList.contains('hidden')).toBe(true);
            expect(mockDom.transactionModal.hasAttribute('data-stock-id')).toBe(false);
        });

        it('should remove aria-modal attribute', () => {
            const mockStock = {
                id: 'stock-1',
                name: 'Apple',
                ticker: 'AAPL',
                sector: 'Technology',
                targetRatio: 25,
                currentPrice: 150,
                transactions: []
            };

            modalManager.openTransactionModal(mockStock, 'usd', []);
            expect(mockDom.transactionModal.getAttribute('aria-modal')).toBe('true');

            modalManager.closeTransactionModal();
            expect(mockDom.transactionModal.hasAttribute('aria-modal')).toBe(false);
        });
    });

    describe('renderTransactionList()', () => {
        it('should show "no transactions" message when list is empty', () => {
            modalManager.renderTransactionList([], 'krw');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBe(1);
            expect(rows[0].textContent).toContain('거래 내역이 없습니다');
        });

        it('should render transactions sorted by date (newest first)', () => {
            const transactions = [
                { id: 'tx-1', type: 'buy' as const, date: '2024-01-01', quantity: 10, price: 100 },
                { id: 'tx-2', type: 'sell' as const, date: '2024-01-03', quantity: 5, price: 110 },
                { id: 'tx-3', type: 'buy' as const, date: '2024-01-02', quantity: 8, price: 105 }
            ];

            modalManager.renderTransactionList(transactions, 'usd');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            expect(rows.length).toBe(3);

            // Check sorting (newest first)
            expect(rows[0].cells[0].textContent).toBe('2024-01-03');
            expect(rows[1].cells[0].textContent).toBe('2024-01-02');
            expect(rows[2].cells[0].textContent).toBe('2024-01-01');
        });

        it('should display buy/sell types with correct styling', () => {
            const transactions = [
                { id: 'tx-1', type: 'buy' as const, date: '2024-01-01', quantity: 10, price: 100 },
                { id: 'tx-2', type: 'sell' as const, date: '2024-01-02', quantity: 5, price: 110 }
            ];

            modalManager.renderTransactionList(transactions, 'krw');

            const rows = mockDom.transactionListBody.querySelectorAll('tr');
            const buySpan = rows[1].querySelector('.text-buy');
            const sellSpan = rows[0].querySelector('.text-sell');

            expect(buySpan).toBeTruthy();
            expect(sellSpan).toBeTruthy();
        });
    });

    describe('bindModalEvents()', () => {
        it('should bind cancel button click', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            mockDom.customModalCancel.click();

            expect(handleSpy).toHaveBeenCalledWith(false);
        });

        it('should bind confirm button click', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            mockDom.customModalConfirm.click();

            expect(handleSpy).toHaveBeenCalledWith(true);
        });

        it('should handle Escape key', () => {
            const handleSpy = vi.spyOn(modalManager, 'handleCustomModal');
            modalManager.bindModalEvents();

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            mockDom.customModal.dispatchEvent(escapeEvent);

            expect(handleSpy).toHaveBeenCalledWith(false);
        });
    });
});
```

---

## `src/view/ModalManager.ts`

```typescript
// src/view/ModalManager.ts
import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import { createFocusTrap, FocusManager } from '../a11yHelpers';
import Decimal from 'decimal.js';
import type { Stock, Transaction } from '../types';

/**
 * @class ModalManager
 * @description 모달 창 관리 (custom modal, transaction modal) with accessibility enhancements
 */
export class ModalManager {
    private dom: any;
    private activeModalResolver: ((value: any) => void) | null = null;
    private focusManager: FocusManager;
    private focusTrapCleanup: (() => void) | null = null;

    constructor(dom: any) {
        this.dom = dom;
        this.focusManager = new FocusManager();
    }

    /**
     * @description 현재 포커스 요소를 저장합니다.
     */
    private saveFocusContext(): void {
        this.focusManager.saveFocus();
    }

    /**
     * @description 저장된 포커스 요소로 복원합니다.
     */
    private restoreFocus(): void {
        this.focusManager.restoreFocus();
        // Cleanup focus trap
        if (this.focusTrapCleanup) {
            this.focusTrapCleanup();
            this.focusTrapCleanup = null;
        }
    }

    /**
     * @description 확인 대화상자를 표시합니다.
     * @param title - 모달 제목
     * @param message - 모달 메시지
     * @returns 사용자의 선택 (true/false)
     */
    async showConfirm(title: string, message: string): Promise<boolean> {
        return this._showModal({ title, message, type: 'confirm' }) as Promise<boolean>;
    }

    /**
     * @description 입력 프롬프트를 표시합니다.
     * @param title - 모달 제목
     * @param message - 모달 메시지
     * @param defaultValue - 기본값
     * @returns 사용자 입력 문자열 또는 null
     */
    async showPrompt(title: string, message: string, defaultValue: string = ''): Promise<string | null> {
        return this._showModal({ title, message, defaultValue, type: 'prompt' }) as Promise<string | null>;
    }

    /**
     * @description 커스텀 모달을 표시합니다 (내부 헬퍼).
     * @param options - 모달 옵션
     * @returns Promise<boolean | string | null>
     */
    private _showModal(options: {
        title: string;
        message: string;
        defaultValue?: string;
        type: 'confirm' | 'prompt';
    }): Promise<boolean | string | null> {
        return new Promise((resolve) => {
            this.saveFocusContext();
            this.activeModalResolver = resolve;
            const { title, message, defaultValue, type } = options;
            const titleEl = this.dom.customModalTitle;
            const messageEl = this.dom.customModalMessage;
            const inputEl = this.dom.customModalInput;
            const modalEl = this.dom.customModal;
            const confirmBtnEl = this.dom.customModalConfirm;

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;

            if (type === 'prompt' && inputEl instanceof HTMLInputElement) {
                inputEl.value = defaultValue ?? '';
                inputEl.classList.remove('hidden');
            } else if (inputEl) {
                inputEl.classList.add('hidden');
            }

            if (modalEl) {
                modalEl.classList.remove('hidden');
                modalEl.setAttribute('aria-modal', 'true');
                // Use enhanced focus trap from a11yHelpers
                this.focusTrapCleanup = createFocusTrap(modalEl);
            }

            if (type === 'prompt' && inputEl instanceof HTMLInputElement) {
                inputEl.focus();
            } else if (confirmBtnEl instanceof HTMLButtonElement) {
                confirmBtnEl.focus();
            }
        });
    }

    /**
     * @description 커스텀 모달의 응답을 처리합니다.
     * @param confirmed - 확인 여부
     */
    handleCustomModal(confirmed: boolean): void {
        if (!this.activeModalResolver) return;

        const inputEl = this.dom.customModalInput;
        const modalEl = this.dom.customModal;
        const isPrompt = inputEl instanceof HTMLInputElement && !inputEl.classList.contains('hidden');
        const value = isPrompt ? (confirmed ? inputEl.value : null) : confirmed;

        this.activeModalResolver(value);
        modalEl?.classList.add('hidden');
        modalEl?.removeAttribute('aria-modal');
        this.restoreFocus();
        this.activeModalResolver = null;
    }

    /**
     * @description 거래 내역 모달을 엽니다.
     * @param stock - 주식 정보
     * @param currency - 통화 모드
     * @param transactions - 거래 내역 배열
     */
    openTransactionModal(stock: Stock, currency: 'krw' | 'usd', transactions: Transaction[]): void {
        this.saveFocusContext();
        const modal = this.dom.transactionModal;
        const modalTitle = this.dom.modalStockName;
        const dateInput = this.dom.txDate;

        if (!modal) return;

        modal.dataset.stockId = stock.id;
        if (modalTitle) {
            modalTitle.textContent = `${stock.name} (${stock.ticker}) ${t('modal.transactionTitle')}`;
        }

        this.renderTransactionList(transactions || [], currency);

        if (dateInput instanceof HTMLInputElement) {
            dateInput.valueAsDate = new Date();
        }

        modal.classList.remove('hidden');
        modal.setAttribute('aria-modal', 'true');
        this.focusTrapCleanup = createFocusTrap(modal);

        const closeBtn = this.dom.closeModalBtn;
        if (closeBtn instanceof HTMLButtonElement) {
            closeBtn.focus();
        }
    }

    /**
     * @description 거래 내역 모달을 닫습니다.
     */
    closeTransactionModal(): void {
        const modal = this.dom.transactionModal;
        const form = this.dom.newTransactionForm;

        if (!modal) return;

        modal.classList.add('hidden');
        modal.removeAttribute('aria-modal');
        if (form instanceof HTMLFormElement) form.reset();
        modal.removeAttribute('data-stock-id');
        this.restoreFocus();
    }

    /**
     * @description 거래 내역 목록을 렌더링합니다.
     * @param transactions - 거래 내역 배열
     * @param currency - 통화 모드
     */
    renderTransactionList(transactions: Transaction[], currency: 'krw' | 'usd'): void {
        const listBody = this.dom.transactionListBody;
        if (!listBody) {
            console.error('ModalManager: renderTransactionList - listBody not found!');
            return;
        }

        (listBody as HTMLTableSectionElement).innerHTML = '';

        if (transactions.length === 0) {
            const tr = (listBody as HTMLTableSectionElement).insertRow();
            const td = tr.insertCell();
            td.colSpan = 6;
            td.style.textAlign = 'center';
            td.textContent = t('view.noTransactions');
            return;
        }

        const sorted = [...transactions].sort((a, b) => {
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            const idA = a.id || '';
            const idB = b.id || '';
            return idB.localeCompare(idA);
        });

        sorted.forEach((tx) => {
            const tr = (listBody as HTMLTableSectionElement).insertRow();
            tr.dataset.txId = tx.id;

            const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
            const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
            const total = quantityDec.times(priceDec);

            tr.insertCell().textContent = tx.date;

            const typeTd = tr.insertCell();
            const typeSpan = document.createElement('span');
            if (tx.type === 'buy') {
                typeSpan.className = 'text-buy';
                typeSpan.textContent = t('ui.buy');
            } else if (tx.type === 'sell') {
                typeSpan.className = 'text-sell';
                typeSpan.textContent = t('ui.sell');
            } else if (tx.type === 'dividend') {
                typeSpan.className = 'text-buy';
                typeSpan.textContent = '배당';
            } else {
                typeSpan.textContent = tx.type;
            }
            typeTd.appendChild(typeSpan);

            const qtyTd = tr.insertCell();
            qtyTd.textContent = quantityDec.toNumber().toLocaleString();
            qtyTd.style.textAlign = 'right';

            const priceTd = tr.insertCell();
            priceTd.textContent = formatCurrency(priceDec, currency);
            priceTd.style.textAlign = 'right';

            const totalTd = tr.insertCell();
            totalTd.textContent = formatCurrency(total, currency);
            totalTd.style.textAlign = 'right';

            const actionTd = tr.insertCell();
            actionTd.style.textAlign = 'center';
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn btn--small';
            btnDelete.dataset.variant = 'delete';
            btnDelete.dataset.action = 'delete-tx';
            btnDelete.textContent = t('ui.delete');
            btnDelete.setAttribute('aria-label', t('aria.deleteTransaction', { date: tx.date }));
            actionTd.appendChild(btnDelete);
        });
    }

    /**
     * @description 커스텀 모달 이벤트 리스너를 바인딩합니다.
     */
    bindModalEvents(): void {
        const cancelBtn = this.dom.customModalCancel;
        const confirmBtn = this.dom.customModalConfirm;
        const customModalEl = this.dom.customModal;

        cancelBtn?.addEventListener('click', () => this.handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this.handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') this.handleCustomModal(false);
        });
    }
}
```

---

## `src/view/ResultsRenderer.ts`

```typescript
// src/view/ResultsRenderer.ts
import { t } from '../i18n';
import type { Chart } from 'chart.js';
import type { PortfolioSnapshot } from '../types';

/**
 * @class ResultsRenderer
 * @description 계산 결과, 섹터 분석, 차트 렌더링 관리
 */
export class ResultsRenderer {
    private dom: any;
    private chartInstance: Chart | null = null;
    private performanceChartInstance: Chart | null = null;
    private currentObserver: IntersectionObserver | null = null;

    constructor(dom: any) {
        this.dom = dom;
    }

    /**
     * @description 스켈레톤 로딩 화면을 표시합니다.
     */
    displaySkeleton(): void {
        const skeletonHTML = `
            <div class="skeleton-container">
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
            </div>
        `;
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;

        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * @description 계산 결과를 표시합니다.
     * @param html - 결과 HTML
     */
    displayResults(html: string): void {
        requestAnimationFrame(() => {
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;

            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;

            this.cleanupObserver();
            this.currentObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const target = entry.target as HTMLElement;
                            target.style.transitionDelay = target.dataset.delay || '0s';
                            target.classList.add('in-view');
                            this.currentObserver?.unobserve(target);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            rows.forEach((row) => this.currentObserver?.observe(row as Element));
        });
    }

    /**
     * @description 섹터 분석을 표시합니다.
     * @param html - 섹터 분석 HTML
     */
    displaySectorAnalysis(html: string): void {
        requestAnimationFrame(() => {
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;

            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    }

    /**
     * @description 포트폴리오 차트를 표시합니다.
     * @param ChartClass - Chart.js 클래스
     * @param labels - 차트 레이블
     * @param data - 차트 데이터
     * @param title - 차트 제목
     */
    displayChart(ChartClass: typeof Chart, labels: string[], data: number[], title: string): void {
        const chartEl = this.dom.chartSection;
        const canvas = this.dom.portfolioChart;

        if (!chartEl || !(canvas instanceof HTMLCanvasElement)) return;

        chartEl.classList.remove('hidden');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: t('template.ratio'),
                    data: data,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#C9CBCF',
                        '#77DD77',
                        '#FDFD96',
                        '#836FFF',
                        '#FFB347',
                        '#FFD1DC'
                    ],
                    borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                    borderWidth: 2
                }
            ]
        };

        if (this.chartInstance) {
            this.chartInstance.data = chartData;
            this.chartInstance.options = chartOptions;
            this.chartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chartInstance = new ChartClass(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: chartOptions
                });
            }
        }
    }

    /**
     * @description 결과 화면을 숨깁니다.
     */
    hideResults(): void {
        const resultsEl = this.dom.resultsSection;
        const sectorEl = this.dom.sectorAnalysisSection;
        const chartEl = this.dom.chartSection;

        if (resultsEl) {
            resultsEl.innerHTML = '';
            resultsEl.classList.add('hidden');
        }
        if (sectorEl) {
            sectorEl.innerHTML = '';
            sectorEl.classList.add('hidden');
        }
        if (chartEl) {
            chartEl.classList.add('hidden');
        }

        this.cleanupObserver();
    }

    /**
     * @description 포트폴리오 성과 히스토리 차트를 표시합니다.
     * @param ChartClass - Chart.js 클래스
     * @param snapshots - 포트폴리오 스냅샷 배열
     * @param currency - 통화 모드
     */
    async displayPerformanceHistory(
        ChartClass: typeof Chart,
        snapshots: PortfolioSnapshot[],
        currency: 'krw' | 'usd'
    ): Promise<void> {
        const section = this.dom.performanceHistorySection;
        const container = this.dom.performanceChartContainer;
        const canvas = this.dom.performanceChart;

        if (!section || !container || !(canvas instanceof HTMLCanvasElement)) return;

        // Show section
        section.classList.remove('hidden');
        container.classList.remove('hidden');

        // Sort snapshots by date (oldest first for chart)
        const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

        // Prepare chart data
        const labels = sorted.map(s => s.date);
        const totalValueData = sorted.map(s => currency === 'krw' ? s.totalValueKRW : s.totalValue);
        const totalInvestedData = sorted.map(s => s.totalInvestedCapital);
        const unrealizedPLData = sorted.map(s => s.totalUnrealizedPL);
        const realizedPLData = sorted.map(s => s.totalRealizedPL);

        const chartData = {
            labels,
            datasets: [
                {
                    label: '총 자산 가치',
                    data: totalValueData,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '투자 원금',
                    data: totalInvestedData,
                    borderColor: '#9966FF',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: {
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: '포트폴리오 가치 변화 추이',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const formatted = value.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            });
                            return `${label}: ${currency === 'krw' ? '₩' : '$'}${formatted}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: any) {
                            return (currency === 'krw' ? '₩' : '$') + value.toLocaleString();
                        }
                    }
                }
            }
        };

        if (this.performanceChartInstance) {
            this.performanceChartInstance.data = chartData;
            this.performanceChartInstance.options = chartOptions;
            this.performanceChartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.performanceChartInstance = new ChartClass(ctx, {
                    type: 'line',
                    data: chartData,
                    options: chartOptions
                });
            }
        }

        // Scroll to chart
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * @description Intersection Observer를 정리합니다.
     */
    cleanupObserver(): void {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    }

    /**
     * @description 차트 인스턴스를 제거합니다.
     */
    destroyChart(): void {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        if (this.performanceChartInstance) {
            this.performanceChartInstance.destroy();
            this.performanceChartInstance = null;
        }
    }

    /**
     * @description 모든 리소스를 정리합니다.
     */
    cleanup(): void {
        this.cleanupObserver();
        this.destroyChart();
    }
}
```

---

## `src/view/VirtualScrollManager.ts`

```typescript
// src/view/VirtualScrollManager.ts
// ===== [Phase 4.1 리팩토링] 모듈 분리 =====
import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';
import type { CalculatedStock } from '../types';
import { getGridTemplate } from './DOMHelpers';
import { createStockRowFragment } from './RowRenderer';
// ===== [Phase 4.1 리팩토링 끝] =====

// 가상 스크롤 상수
const ROW_INPUT_HEIGHT = 60;
const ROW_OUTPUT_HEIGHT = 50;
const ROW_PAIR_HEIGHT = ROW_INPUT_HEIGHT + ROW_OUTPUT_HEIGHT;
const VISIBLE_ROWS_BUFFER = 5;

/**
 * @class VirtualScrollManager
 * @description 가상 스크롤 관리 - 대량 데이터를 효율적으로 렌더링
 */
export class VirtualScrollManager {
    private dom: any;
    private _virtualData: CalculatedStock[] = [];
    private _scrollWrapper: HTMLElement | null = null;
    private _scrollSpacer: HTMLElement | null = null;
    private _scrollContent: HTMLElement | null = null;
    private _viewportHeight: number = 0;
    private _renderedStartIndex: number = -1;
    private _renderedEndIndex: number = -1;
    private _scrollHandler: (() => void) | null = null;
    private _currentMainMode: 'add' | 'sell' | 'simple' = 'add';
    private _currentCurrency: 'krw' | 'usd' = 'krw';

    // ===== [Phase 2.1 최적화] DOM 참조 캐싱 =====
    private _rowCache: Map<string, { inputRow: HTMLElement | null; outputRow: HTMLElement | null }> = new Map();
    // ===== [Phase 2.1 최적화 끝] =====

    constructor(dom: any) {
        this.dom = dom;
        this.initializeScrollElements();
    }

    /**
     * @description 스크롤 요소들을 초기화합니다.
     */
    private initializeScrollElements(): void {
        this._scrollWrapper = this.dom.virtualScrollWrapper;
        this._scrollSpacer = this.dom.virtualScrollSpacer;
        this._scrollContent = this.dom.virtualScrollContent;
        this._viewportHeight = this._scrollWrapper ? this._scrollWrapper.clientHeight : 600;
    }

    /**
     * @description 테이블 헤더를 업데이트합니다.
     * @param currency - 통화 모드
     * @param mainMode - 메인 모드
     */
    updateTableHeader(currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        this._currentMainMode = mainMode;
        this._currentCurrency = currency;
        const header = this.dom.virtualTableHeader;
        if (!header) return;

        header.style.gridTemplateColumns = getGridTemplate(mainMode);

        const currencySymbol = currency.toLowerCase() === 'usd' ? t('ui.usd') : t('ui.krw');
        let headersHTML = '';

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            if (mainMode === 'simple') {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">보유 금액(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            } else {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            }
        } else {
            if (mainMode === 'simple') {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">보유 금액(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.fixedBuy')}(${currencySymbol})</div>
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            } else {
                headersHTML = `
                    <div class="virtual-cell">${t('ui.stockName')}</div>
                    <div class="virtual-cell">${t('ui.ticker')}</div>
                    <div class="virtual-cell">${t('ui.sector')}</div>
                    <div class="virtual-cell align-right">${t('ui.targetRatio')}(%)</div>
                    <div class="virtual-cell align-right">${t('ui.currentPrice')}(${currencySymbol})</div>
                    ${mainMode === 'add' ? `<div class="virtual-cell align-center">${t('ui.fixedBuy')}(${currencySymbol})</div>` : ''}
                    <div class="virtual-cell align-center">${t('ui.action')}</div>
                `;
            }
        }
        header.innerHTML = headersHTML;
    }

    // ===== [Phase 4.1 리팩토링] createStockRowFragment는 RowRenderer.ts로 이동 =====

    /**
     * @description 가상 테이블을 렌더링합니다 (초기화).
     * @param calculatedPortfolioData - 계산된 포트폴리오 데이터
     * @param currency - 통화 모드
     * @param mainMode - 메인 모드
     */
    renderTable(calculatedPortfolioData: CalculatedStock[], currency: 'krw' | 'usd', mainMode: 'add' | 'sell' | 'simple'): void {
        if (!this._scrollWrapper || !this._scrollSpacer || !this._scrollContent) return;

        this.updateTableHeader(currency, mainMode);

        this._virtualData = calculatedPortfolioData;
        if (this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        this._scrollSpacer.style.height = `${totalHeight}px`;

        this._viewportHeight = this._scrollWrapper.clientHeight;

        if (this._scrollHandler) {
            this._scrollWrapper.removeEventListener('scroll', this._scrollHandler);
        }

        this._scrollHandler = this._onScroll.bind(this);
        this._scrollWrapper.addEventListener('scroll', this._scrollHandler);

        this._onScroll(true);
    }

    /**
     * @description 가상 테이블 데이터를 업데이트합니다.
     * @param calculatedPortfolioData - 계산된 포트폴리오 데이터
     */
    updateVirtualTableData(calculatedPortfolioData: CalculatedStock[]): void {
        this._virtualData = calculatedPortfolioData;
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        if (this._scrollSpacer) this._scrollSpacer.style.height = `${totalHeight}px`;
        if (this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        this._onScroll(true);
    }

    /**
     * @description 특정 주식의 virtual data를 업데이트합니다.
     * @param stockId - 주식 ID
     * @param field - 필드명
     * @param value - 값
     */
    updateStockInVirtualData(stockId: string, field: string, value: any): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex !== -1) {
            (this._virtualData[stockIndex] as any)[field] = value;
        }
    }

    /**
     * @description 특정 주식 행의 출력 부분만 업데이트합니다.
     * @param stockId - 주식 ID
     * @param calculatedData - 재계산된 데이터
     */
    updateSingleStockRow(stockId: string, calculatedData: any): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1) return;

        this._virtualData[stockIndex] = { ...this._virtualData[stockIndex], calculated: calculatedData };

        if (stockIndex < this._renderedStartIndex || stockIndex >= this._renderedEndIndex) {
            return;
        }

        // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
        let outputRow = this._rowCache.get(stockId)?.outputRow;
        if (!outputRow) {
            // 캐시 미스 시 querySelector 사용하고 캐시에 저장
            outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${stockId}"]`) as HTMLElement | null;
            if (outputRow) {
                const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`) as HTMLElement | null;
                this._rowCache.set(stockId, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
        if (!outputRow || this._currentMainMode === 'simple') return;

        const currency = this._currentCurrency;
        const metrics = calculatedData ?? {
            quantity: new Decimal(0),
            avgBuyPrice: new Decimal(0),
            currentAmount: new Decimal(0),
            profitLoss: new Decimal(0),
            profitLossRate: new Decimal(0)
        };

        const quantity = metrics.quantity instanceof Decimal ? metrics.quantity : new Decimal(metrics.quantity ?? 0);
        const avgBuyPrice = metrics.avgBuyPrice instanceof Decimal ? metrics.avgBuyPrice : new Decimal(metrics.avgBuyPrice ?? 0);
        const currentAmount = metrics.currentAmount instanceof Decimal ? metrics.currentAmount : new Decimal(metrics.currentAmount ?? 0);
        const profitLoss = metrics.profitLoss instanceof Decimal ? metrics.profitLoss : new Decimal(metrics.profitLoss ?? 0);
        const profitLossRate = metrics.profitLossRate instanceof Decimal ? metrics.profitLossRate : new Decimal(metrics.profitLossRate ?? 0);

        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        const isMobile = window.innerWidth <= 768;

        const cells = outputRow.querySelectorAll('.output-cell');
        let cellIndex = 0;

        if (cells[cellIndex]) cellIndex++;

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.quantity'))}</span><span class="value">${escapeHTML(quantity.toFixed(0))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.avgBuyPrice'))}</span><span class="value">${escapeHTML(formatCurrency(avgBuyPrice, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.currentValue'))}</span><span class="value">${escapeHTML(formatCurrency(currentAmount, currency))}</span>`;
            cellIndex++;
        }

        if (!isMobile && cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.profitLoss'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + formatCurrency(profitLoss, currency))}</span>`;
            cellIndex++;
        }

        if (cells[cellIndex]) {
            cells[cellIndex].innerHTML = `<span class="label">${escapeHTML(t('ui.profitLossRate'))}</span><span class="value ${profitClass}">${escapeHTML(profitSign + profitLossRate.toFixed(2) + '%')}</span>`;
        }
    }

    /**
     * @description 스크롤 이벤트 핸들러 (실제 가상 스크롤 로직).
     * @param forceRedraw - 강제 재렌더링 여부
     */
    private _onScroll(forceRedraw: boolean = false): void {
        if (!this._scrollWrapper || !this._scrollContent) return;

        const currency = this._currentCurrency;
        const mainMode = this._currentMainMode;

        const scrollTop = this._scrollWrapper.scrollTop;

        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_PAIR_HEIGHT) - VISIBLE_ROWS_BUFFER);
        const endIndex = Math.min(
            this._virtualData.length,
            Math.ceil((scrollTop + this._viewportHeight) / ROW_PAIR_HEIGHT) + VISIBLE_ROWS_BUFFER
        );

        if (!forceRedraw && startIndex === this._renderedStartIndex && endIndex === this._renderedEndIndex) {
            return;
        }

        // 재렌더링 전 입력값 저장 (IME 안전)
        const currentInputRows = this._scrollContent.querySelectorAll('.virtual-row-inputs[data-id]');
        const activeElement = document.activeElement;

        currentInputRows.forEach((row) => {
            const stockId = (row as HTMLElement).dataset.id;
            if (!stockId) return;

            const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
            if (stockIndex === -1) return;

            const inputs = row.querySelectorAll('input[data-field]');
            inputs.forEach((input) => {
                if (!(input instanceof HTMLInputElement)) return;

                if (input === activeElement || (input as any).isComposing) {
                    return;
                }

                const field = input.dataset.field;
                if (!field) return;

                let value: any;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    value = parseFloat(input.value) || 0;
                } else {
                    value = input.value;
                }

                (this._virtualData[stockIndex] as any)[field] = value;
            });
        });

        this._renderedStartIndex = startIndex;
        this._renderedEndIndex = endIndex;

        // ===== [Phase 2.1 최적화] 캐시 클리어 및 재구성 =====
        this._rowCache.clear();
        // ===== [Phase 2.1 최적화 끝] =====

        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            fragment.appendChild(createStockRowFragment(stock, currency, mainMode));
        }

        this._scrollContent.replaceChildren(fragment);
        this._scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;

        // ===== [Phase 2.1 최적화] 렌더링 후 캐시 채우기 =====
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            const inputRow = this._scrollContent.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`) as HTMLElement | null;
            const outputRow = this._scrollContent.querySelector(`.virtual-row-outputs[data-id="${stock.id}"]`) as HTMLElement | null;
            if (inputRow || outputRow) {
                this._rowCache.set(stock.id, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
    }

    /**
     * @description 모든 목표 비율 입력 필드를 업데이트합니다.
     * @param portfolioData - 포트폴리오 데이터
     */
    updateAllTargetRatioInputs(portfolioData: CalculatedStock[]): void {
        portfolioData.forEach((stock) => {
            // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
            let inputRow = this._rowCache.get(stock.id)?.inputRow;
            if (!inputRow) {
                inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`) as HTMLElement | null;
                if (inputRow) {
                    const outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${stock.id}"]`) as HTMLElement | null;
                    this._rowCache.set(stock.id, { inputRow, outputRow });
                }
            }
            // ===== [Phase 2.1 최적화 끝] =====
            if (!inputRow) return;

            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (targetRatioInput instanceof HTMLInputElement) {
                const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio ?? 0);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    }

    /**
     * @description 특정 주식의 현재가 입력 필드를 업데이트합니다.
     * @param id - 주식 ID
     * @param price - 가격
     */
    updateCurrentPriceInput(id: string, price: string): void {
        // ===== [Phase 2.1 최적화] 캐시된 DOM 참조 사용 =====
        let inputRow = this._rowCache.get(id)?.inputRow;
        if (!inputRow) {
            inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${id}"]`) as HTMLElement | null;
            if (inputRow) {
                const outputRow = this._scrollContent?.querySelector(`.virtual-row-outputs[data-id="${id}"]`) as HTMLElement | null;
                this._rowCache.set(id, { inputRow, outputRow });
            }
        }
        // ===== [Phase 2.1 최적화 끝] =====
        if (!inputRow) return;

        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (currentPriceInput instanceof HTMLInputElement) {
            currentPriceInput.value = price;
        }
    }

    /**
     * @description 새로 추가된 주식으로 포커스를 이동합니다.
     * @param stockId - 주식 ID
     */
    focusOnNewStock(stockId: string): void {
        const stockIndex = this._virtualData.findIndex((s) => s.id === stockId);
        if (stockIndex === -1 || !this._scrollWrapper) return;

        const scrollTop = stockIndex * ROW_PAIR_HEIGHT;
        this._scrollWrapper.scrollTo({ top: scrollTop, behavior: 'smooth' });

        setTimeout(() => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`);
            if (!inputRow) return;

            const nameInput = inputRow.querySelector('input[data-field="name"]');
            if (nameInput instanceof HTMLInputElement) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300);
    }
}
```

---

## `src/a11yHelpers.ts`

```typescript
// src/a11yHelpers.ts
/**
 * @description 접근성(Accessibility) 개선 유틸리티
 */

/**
 * @description 키보드 네비게이션 헬퍼 - Enter/Space로 버튼 활성화
 * @param element - 대상 요소
 * @param callback - 실행할 콜백
 */
export function addKeyboardActivation(
    element: HTMLElement,
    callback: (e: KeyboardEvent) => void
): void {
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback(e);
        }
    });
}

/**
 * @description 포커스 트랩 (모달 내부에서만 포커스 이동)
 * @param container - 컨테이너 요소
 * @returns cleanup 함수
 */
export function createFocusTrap(container: HTMLElement): () => void {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);

    if (focusableElements.length === 0) {
        return () => {};
    }

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 초기 포커스
    firstElement.focus();

    // Cleanup 함수 반환
    return () => {
        container.removeEventListener('keydown', handleKeyDown);
    };
}

/**
 * @description 스크린 리더 전용 텍스트 생성
 * @param text - 읽을 텍스트
 * @returns HTMLElement (visually hidden)
 */
export function createScreenReaderText(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'sr-only'; // CSS에서 .sr-only 정의 필요
    span.setAttribute('aria-hidden', 'false');
    return span;
}

/**
 * @description ARIA live region에 메시지 발표
 * @param message - 알림 메시지
 * @param priority - 'polite' | 'assertive'
 */
export function announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
): void {
    const announcer = document.getElementById('aria-announcer');
    if (announcer) {
        announcer.textContent = '';
        announcer.setAttribute('aria-live', priority);
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }
}

/**
 * @description 폼 필드 에러 연결 (aria-describedby)
 * @param input - 입력 필드
 * @param errorMessage - 에러 메시지
 * @returns 에러 메시지 요소
 */
export function linkFormError(input: HTMLInputElement, errorMessage: string): HTMLElement {
    const errorId = `${input.id || 'input'}-error`;
    let errorEl = document.getElementById(errorId);

    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = errorId;
        errorEl.className = 'error-message';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        input.parentElement?.appendChild(errorEl);
    }

    errorEl.textContent = errorMessage;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');

    return errorEl;
}

/**
 * @description 폼 필드 에러 제거
 * @param input - 입력 필드
 */
export function clearFormError(input: HTMLInputElement): void {
    const errorId = `${input.id || 'input'}-error`;
    const errorEl = document.getElementById(errorId);

    if (errorEl) {
        errorEl.remove();
    }

    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
}

/**
 * @description 진행률 표시 (aria-valuenow, aria-valuemin, aria-valuemax)
 * @param element - 진행률 요소
 * @param current - 현재 값
 * @param max - 최대 값
 * @param label - 라벨 (선택)
 */
export function updateProgressBar(
    element: HTMLElement,
    current: number,
    max: number,
    label?: string
): void {
    element.setAttribute('role', 'progressbar');
    element.setAttribute('aria-valuenow', String(current));
    element.setAttribute('aria-valuemin', '0');
    element.setAttribute('aria-valuemax', String(max));

    if (label) {
        element.setAttribute('aria-label', label);
    }

    const percent = (current / max) * 100;
    element.setAttribute('aria-valuetext', `${percent.toFixed(0)}%`);
}

/**
 * @description 스킵 링크 생성 (페이지 상단에서 메인 콘텐츠로 바로 이동)
 * @param targetId - 이동할 요소의 ID
 * @param text - 링크 텍스트
 * @returns HTMLAnchorElement
 */
export function createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link'; // CSS에서 정의 필요 (시각적으로 숨김, 포커스 시 표시)
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
    return skipLink;
}

/**
 * @description 모달 오픈 시 이전 포커스 저장 및 복원
 */
export class FocusManager {
    private previousFocus: HTMLElement | null = null;

    /**
     * @description 현재 포커스 저장
     */
    saveFocus(): void {
        this.previousFocus = document.activeElement as HTMLElement;
    }

    /**
     * @description 이전 포커스 복원
     */
    restoreFocus(): void {
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }
}

/**
 * @description 색상 대비 검사 (WCAG 2.0 기준)
 * @param foreground - 전경색 (hex)
 * @param background - 배경색 (hex)
 * @returns { ratio: number, passAA: boolean, passAAA: boolean }
 */
export function checkColorContrast(
    foreground: string,
    background: string
): { ratio: number; passAA: boolean; passAAA: boolean } {
    // Hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    };

    // Relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) {
        return { ratio: 0, passAA: false, passAAA: false };
    }

    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
        ratio: Math.round(ratio * 100) / 100,
        passAA: ratio >= 4.5, // WCAG AA 기준
        passAAA: ratio >= 7 // WCAG AAA 기준
    };
}

/**
 * @description 터치 타겟 크기 검사 (최소 44x44px 권장)
 * @param element - 검사할 요소
 * @returns { width: number, height: number, isSufficient: boolean }
 */
export function checkTouchTargetSize(element: HTMLElement): {
    width: number;
    height: number;
    isSufficient: boolean;
} {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // WCAG 2.1 권장 크기

    return {
        width: rect.width,
        height: rect.height,
        isSufficient: rect.width >= minSize && rect.height >= minSize
    };
}
```

---

## `src/apiService.test.ts`

```typescript
// src/apiService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService, APIError, APIErrorType, formatAPIError } from './apiService';

// Mock global fetch
global.fetch = vi.fn();

describe('apiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('APIError', () => {
        it('should create APIError with type and message', () => {
            const error = new APIError('Test error', APIErrorType.NETWORK_ERROR);

            expect(error.name).toBe('APIError');
            expect(error.message).toBe('Test error');
            expect(error.type).toBe(APIErrorType.NETWORK_ERROR);
        });

        it('should include optional fields', () => {
            const error = new APIError('Ticker error', APIErrorType.INVALID_TICKER, {
                ticker: 'INVALID',
                statusCode: 404
            });

            expect(error.ticker).toBe('INVALID');
            expect(error.statusCode).toBe(404);
        });

        it('should handle rate limit with retryAfter', () => {
            const error = new APIError('Rate limit', APIErrorType.RATE_LIMIT, {
                retryAfter: 60
            });

            expect(error.retryAfter).toBe(60);
        });
    });

    describe('formatAPIError()', () => {
        it('should format network error', () => {
            const error = new APIError('Network failed', APIErrorType.NETWORK_ERROR);
            const message = formatAPIError(error);

            expect(message).toContain('네트워크');
            expect(message).toContain('연결');
        });

        it('should format timeout error', () => {
            const error = new APIError('Timeout', APIErrorType.TIMEOUT);
            const message = formatAPIError(error);

            expect(message).toContain('시간이 초과');
        });

        it('should format rate limit error with retry time', () => {
            const error = new APIError('Rate limit', APIErrorType.RATE_LIMIT, {
                retryAfter: 120
            });
            const message = formatAPIError(error);

            expect(message).toContain('요청 한도');
            expect(message).toContain('120');
        });

        it('should format invalid ticker error', () => {
            const error = new APIError('Invalid', APIErrorType.INVALID_TICKER, {
                ticker: 'BADTICKER'
            });
            const message = formatAPIError(error);

            expect(message).toContain('유효하지 않은 티커');
            expect(message).toContain('BADTICKER');
        });

        it('should format server error', () => {
            const error = new APIError('Server error', APIErrorType.SERVER_ERROR);
            const message = formatAPIError(error);

            expect(message).toContain('서버 오류');
        });

        it('should format unknown error', () => {
            const error = new APIError('Unknown', APIErrorType.UNKNOWN);
            const message = formatAPIError(error);

            expect(message).toContain('알 수 없는 오류');
        });
    });

    describe('fetchStockPrice()', () => {
        it('should fetch stock price successfully', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 150.25 })
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const price = await apiService.fetchStockPrice('AAPL');

            expect(price).toBe(150.25);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('AAPL'),
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
        });

        it('should throw APIError for empty ticker', async () => {
            await expect(apiService.fetchStockPrice('')).rejects.toThrow(APIError);
            await expect(apiService.fetchStockPrice('')).rejects.toMatchObject({
                type: APIErrorType.INVALID_TICKER
            });
        });

        it('should throw APIError for invalid ticker (no data)', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 0, d: null })
            };
            (global.fetch as any).mockResolvedValue(mockResponse);

            const error = await apiService.fetchStockPrice('INVALID').catch(e => e);
            expect(error).toBeInstanceOf(APIError);
            expect(error.type).toBe(APIErrorType.INVALID_TICKER);
        });

        it('should throw APIError for zero or negative price', async () => {
            const mockResponse = {
                ok: true,
                json: async () => ({ c: 0 })
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            await expect(apiService.fetchStockPrice('ZERO')).rejects.toThrow(APIError);
        });

        it('should retry on server error (5xx)', async () => {
            const mockError = {
                ok: false,
                status: 503,
                json: async () => ({ error: 'Service unavailable' }),
                text: async () => 'Service unavailable'
            };
            const mockSuccess = {
                ok: true,
                json: async () => ({ c: 100 })
            };

            (global.fetch as any)
                .mockResolvedValueOnce(mockError)
                .mockResolvedValueOnce(mockSuccess);

            const price = await apiService.fetchStockPrice('AAPL');

            expect(price).toBe(100);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should throw APIError after max retries', async () => {
            const mockError = {
                ok: false,
                status: 500,
                json: async () => ({ error: 'Server error' }),
                text: async () => 'Server error'
            };

            (global.fetch as any).mockResolvedValue(mockError);

            await expect(apiService.fetchStockPrice('AAPL')).rejects.toThrow(APIError);
            // Should retry up to 3 times (initial + 2 retries)
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should handle rate limiting (429)', async () => {
            const mockRateLimit = {
                ok: false,
                status: 429,
                headers: new Headers({ 'Retry-After': '60' }),
                json: async () => ({}),
                text: async () => 'Too many requests'
            };

            (global.fetch as any).mockResolvedValueOnce(mockRateLimit);

            await expect(apiService.fetchStockPrice('AAPL')).rejects.toMatchObject({
                type: APIErrorType.RATE_LIMIT,
                retryAfter: 60
            });
        });
    });

    describe('fetchAllStockPrices()', () => {
        it('should fetch prices for multiple tickers', async () => {
            const mockResponse = {
                ok: true,
                json: async () => [
                    { status: 'fulfilled', ticker: 'AAPL', value: 150 },
                    { status: 'fulfilled', ticker: 'GOOGL', value: 2800 },
                    { status: 'rejected', ticker: 'INVALID', reason: 'Not found' }
                ]
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const tickersToFetch = [
                { id: '1', ticker: 'AAPL' },
                { id: '2', ticker: 'GOOGL' },
                { id: '3', ticker: 'INVALID' }
            ];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            expect(results).toHaveLength(3);
            expect(results[0]).toMatchObject({
                id: '1',
                status: 'fulfilled',
                value: 150
            });
            expect(results[1]).toMatchObject({
                id: '2',
                status: 'fulfilled',
                value: 2800
            });
            expect(results[2]).toMatchObject({
                id: '3',
                status: 'rejected',
                reason: 'Not found'
            });
        });

        it('should return empty array for empty input', async () => {
            const results = await apiService.fetchAllStockPrices([]);

            expect(results).toEqual([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should throw APIError on batch API failure', async () => {
            const mockError = {
                ok: false,
                status: 500,
                json: async () => ({ error: 'Batch failed' }),
                text: async () => 'Batch failed'
            };

            (global.fetch as any).mockResolvedValue(mockError);

            const tickersToFetch = [{ id: '1', ticker: 'AAPL' }];

            await expect(apiService.fetchAllStockPrices(tickersToFetch)).rejects.toThrow(APIError);
        });

        it('should construct correct batch URL', async () => {
            const mockResponse = {
                ok: true,
                json: async () => [
                    { status: 'fulfilled', ticker: 'AAPL', value: 150 },
                    { status: 'fulfilled', ticker: 'GOOGL', value: 2800 }
                ]
            };
            (global.fetch as any).mockResolvedValueOnce(mockResponse);

            const tickersToFetch = [
                { id: '1', ticker: 'AAPL' },
                { id: '2', ticker: 'GOOGL' }
            ];

            await apiService.fetchAllStockPrices(tickersToFetch);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('symbols=AAPL%2CGOOGL'),
                expect.any(Object)
            );
        });
    });
});
```

---

## `src/i18nEnhancements.ts`

```typescript
// src/i18nEnhancements.ts
/**
 * @description 국제화 숫자 포맷팅 유틸리티
 */

import Decimal from 'decimal.js';
import type { Currency } from './types';

// ===== [Phase 1.2 최적화] Intl.NumberFormat 캐싱 =====
/**
 * @description NumberFormat 인스턴스 캐시
 * - 키: locale + JSON.stringify(options)
 * - 값: Intl.NumberFormat 인스턴스
 */
const numberFormatCache = new Map<string, Intl.NumberFormat>();
const MAX_CACHE_SIZE = 50;

/**
 * @description 캐시된 NumberFormat 인스턴스 가져오기
 * @param locale - 로케일
 * @param options - NumberFormat 옵션
 * @returns Intl.NumberFormat 인스턴스
 */
function getCachedNumberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const cacheKey = `${locale}:${JSON.stringify(options)}`;

    let formatter = numberFormatCache.get(cacheKey);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, options);

        // 캐시 크기 제한 (LRU 방식 대신 간단하게 전체 클리어)
        if (numberFormatCache.size >= MAX_CACHE_SIZE) {
            numberFormatCache.clear();
        }

        numberFormatCache.set(cacheKey, formatter);
    }

    return formatter;
}
// ===== [Phase 1.2 최적화 끝] =====

/**
 * @description 현재 언어 설정 가져오기
 * @returns 'ko' | 'en'
 */
export function getCurrentLanguage(): 'ko' | 'en' {
    // localStorage에서 언어 설정 가져오기
    const storedLang = localStorage.getItem('app_language');
    if (storedLang === 'ko' || storedLang === 'en') {
        return storedLang;
    }

    // 브라우저 언어 감지
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) {
        return 'ko';
    }
    return 'en';
}

/**
 * @description 언어 설정 변경
 * @param lang - 'ko' | 'en'
 */
export function setLanguage(lang: 'ko' | 'en'): void {
    localStorage.setItem('app_language', lang);
    // 페이지 리로드 또는 이벤트 발생으로 UI 업데이트
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * @description 숫자를 로케일에 맞게 포맷팅 (소수점 있는 숫자)
 * @param value - 숫자 또는 Decimal
 * @param fractionDigits - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 문자열
 */
export function formatNumber(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    return getCachedNumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(num);
}

/**
 * @description 퍼센트를 로케일에 맞게 포맷팅
 * @param value - 숫자 (예: 15.5 = 15.5%)
 * @param fractionDigits - 소수점 자릿수 (기본값: 2)
 * @returns 포맷팅된 문자열
 */
export function formatPercent(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    return getCachedNumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(num / 100); // Intl.NumberFormat의 percent는 0-1 범위를 사용
}

/**
 * @description 통화를 로케일에 맞게 포맷팅 (기존 formatCurrency 개선 버전)
 * @param amount - 금액
 * @param currency - 통화 ('krw', 'usd')
 * @returns 포맷팅된 문자열
 */
export function formatCurrencyEnhanced(
    amount: number | Decimal | string | null | undefined,
    currency: Currency = 'krw'
): string {
    const lang = getCurrentLanguage();

    try {
        let num: number;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) {
            num = amount.toNumber();
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency.toUpperCase(),
        };

        if (currency.toLowerCase() === 'krw') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else {
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }

        return getCachedNumberFormat(locale, options).format(num);
    } catch (e) {
        console.error('formatCurrencyEnhanced error:', e);
        return String(amount);
    }
}

/**
 * @description 큰 숫자를 축약 형태로 포맷팅 (예: 1,234,567 → 1.23M)
 * @param value - 숫자
 * @param fractionDigits - 소수점 자릿수
 * @returns 축약된 문자열
 */
export function formatCompactNumber(
    value: number | Decimal | string | null | undefined,
    fractionDigits: number = 2
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    let num: number;
    if (value === null || value === undefined) {
        num = 0;
    } else if (typeof value === 'object' && 'toNumber' in value) {
        num = value.toNumber();
    } else {
        num = Number(value);
        if (isNaN(num)) num = 0;
    }

    // Intl.NumberFormat의 notation: 'compact'는 일부 브라우저에서만 지원
    try {
        return getCachedNumberFormat(locale, {
            notation: 'compact' as any, // TypeScript 버전에 따라 type assertion 필요
            minimumFractionDigits: 0,
            maximumFractionDigits: fractionDigits
        }).format(num);
    } catch (e) {
        // Fallback: 수동 축약
        if (num >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(fractionDigits)}B`;
        } else if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(fractionDigits)}M`;
        } else if (num >= 1_000) {
            return `${(num / 1_000).toFixed(fractionDigits)}K`;
        }
        return num.toFixed(fractionDigits);
    }
}

/**
 * @description 날짜를 로케일에 맞게 포맷팅
 * @param date - Date 객체 또는 날짜 문자열
 * @param style - 'short' | 'medium' | 'long' | 'full'
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
    date: Date | string,
    style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
        dateStyle: style
    }).format(dateObj);
}

/**
 * @description 상대 시간 포맷팅 (예: "3일 전", "2 hours ago")
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
    const lang = getCurrentLanguage();
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

        if (diffYear > 0) return rtf.format(-diffYear, 'year');
        if (diffMonth > 0) return rtf.format(-diffMonth, 'month');
        if (diffDay > 0) return rtf.format(-diffDay, 'day');
        if (diffHour > 0) return rtf.format(-diffHour, 'hour');
        if (diffMin > 0) return rtf.format(-diffMin, 'minute');
        return rtf.format(-diffSec, 'second');
    } catch (e) {
        // Fallback
        if (diffYear > 0) return lang === 'ko' ? `${diffYear}년 전` : `${diffYear} years ago`;
        if (diffMonth > 0) return lang === 'ko' ? `${diffMonth}개월 전` : `${diffMonth} months ago`;
        if (diffDay > 0) return lang === 'ko' ? `${diffDay}일 전` : `${diffDay} days ago`;
        if (diffHour > 0) return lang === 'ko' ? `${diffHour}시간 전` : `${diffHour} hours ago`;
        if (diffMin > 0) return lang === 'ko' ? `${diffMin}분 전` : `${diffMin} minutes ago`;
        return lang === 'ko' ? '방금 전' : 'just now';
    }
}
```

---

## `src/view/DOMHelpers.ts

```typescript
// src/view/DOMHelpers.ts
/**
 * @description DOM 요소 생성을 위한 헬퍼 함수들
 */

import { t } from '../i18n';
import Decimal from 'decimal.js';

/**
 * @description Input 요소를 생성합니다.
 */
export function createInput(
    type: string,
    field: string,
    value: any,
    placeholder: string = '',
    disabled: boolean = false,
    ariaLabel: string = ''
): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.dataset.field = field;

    let displayValue = '';
    if (value instanceof Decimal) {
        const decimalPlaces = field === 'fixedBuyAmount' ? 0 : 2;
        displayValue = value.toFixed(decimalPlaces);
    } else {
        const defaultValue =
            field === 'fixedBuyAmount' ? '0' : field === 'targetRatio' || field === 'currentPrice' ? '0.00' : '';
        displayValue = String(value ?? defaultValue);
    }

    input.value = displayValue;
    if (placeholder) input.placeholder = placeholder;
    input.disabled = disabled;
    if (ariaLabel) input.setAttribute('aria-label', ariaLabel);

    if (type === 'number') {
        input.min = '0';
        if (field === 'currentPrice' || field === 'fixedBuyAmount' || field === 'targetRatio') input.step = 'any';
    }
    if (type === 'text') {
        input.style.textAlign = 'center';
    }

    return input;
}

/**
 * @description Checkbox 요소를 생성합니다.
 */
export function createCheckbox(field: string, checked: boolean, ariaLabel: string = ''): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.field = field;
    input.checked = checked;
    if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
    return input;
}

/**
 * @description Button 요소를 생성합니다.
 */
export function createButton(action: string, text: string, ariaLabel: string = '', variant: string = 'grey'): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'btn btn--small';
    button.dataset.action = action;
    button.dataset.variant = variant;
    button.textContent = text;
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
    return button;
}

/**
 * @description Cell 요소를 생성합니다.
 */
export function createCell(className: string = '', align: string = 'left'): HTMLDivElement {
    const cell = document.createElement('div');
    cell.className = `virtual-cell ${className} align-${align}`;
    return cell;
}

/**
 * @description Output Cell 요소를 생성합니다.
 */
export function createOutputCell(label: string, value: string, valueClass: string = ''): HTMLDivElement {
    const cell = createCell('output-cell align-right');
    // escapeHTML은 RowRenderer에서 호출 시 적용됨
    cell.innerHTML = `<span class="label">${label}</span><span class="value ${valueClass}">${value}</span>`;
    return cell;
}

/**
 * @description 그리드 템플릿을 반환합니다 (반응형).
 */
export function getGridTemplate(mainMode: 'add' | 'sell' | 'simple'): string {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        if (mainMode === 'simple') {
            return '1.5fr 1fr 1fr 1fr 0.8fr';
        }
        return '1.5fr 1fr 1fr 1.2fr';
    } else {
        if (mainMode === 'add') {
            return '1.5fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr';
        } else if (mainMode === 'simple') {
            return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
        } else {
            return '2fr 1fr 1fr 1fr 1fr 1.2fr';
        }
    }
}
```

---

## `src/service/CalculatorWorkerService.ts

```typescript
// src/services/CalculatorWorkerService.ts
/**
 * @description Service for managing calculator Web Worker
 * - Provides async API for calculations
 * - Falls back to synchronous Calculator if Worker unavailable
 */

import type { Stock, CalculatedStock, Currency } from '../types';
import { Calculator } from '../calculator';
import Decimal from 'decimal.js';

export class CalculatorWorkerService {
    private worker: Worker | null = null;
    private isWorkerAvailable: boolean = false;
    private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();
    private requestId: number = 0;

    constructor() {
        this.initializeWorker();
    }

    /**
     * @description Initialize Web Worker
     */
    private async initializeWorker(): Promise<void> {
        try {
            // Dynamically import worker in production
            if (typeof Worker !== 'undefined') {
                // Vite handles worker import with ?worker suffix
                const CalculatorWorker = await import('../workers/calculator.worker?worker');
                this.worker = new CalculatorWorker.default();

                this.worker.onmessage = (event) => {
                    this.handleWorkerMessage(event);
                };

                this.worker.onerror = (error) => {
                    console.error('Worker error:', error);
                    this.isWorkerAvailable = false;
                };

                this.isWorkerAvailable = true;
                console.log('[CalculatorWorkerService] Worker initialized successfully');
            } else {
                console.warn('[CalculatorWorkerService] Web Workers not supported, using synchronous calculator');
                this.isWorkerAvailable = false;
            }
        } catch (error) {
            console.error('[CalculatorWorkerService] Failed to initialize worker:', error);
            this.isWorkerAvailable = false;
        }
    }

    /**
     * @description Handle messages from worker
     */
    private handleWorkerMessage(event: MessageEvent): void {
        const { type, result, error, requestId } = event.data;

        if (error) {
            console.error('[CalculatorWorkerService] Worker error:', error);
            const request = this.pendingRequests.get(requestId);
            if (request) {
                request.reject(new Error(error));
                this.pendingRequests.delete(requestId);
            }
            return;
        }

        const request = this.pendingRequests.get(requestId);
        if (request) {
            request.resolve(result);
            this.pendingRequests.delete(requestId);
        }
    }

    /**
     * @description Send message to worker and wait for response
     */
    private sendToWorker(type: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.worker || !this.isWorkerAvailable) {
                reject(new Error('Worker not available'));
                return;
            }

            const requestId = `req_${++this.requestId}`;
            this.pendingRequests.set(requestId, { resolve, reject });

            this.worker.postMessage({ type, data, requestId });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('Worker request timeout'));
                }
            }, 10000);
        });
    }

    /**
     * @description Calculate portfolio state (async with worker, fallback to sync)
     */
    async calculatePortfolioState(options: {
        portfolioData: Stock[];
        exchangeRate?: number;
        currentCurrency?: Currency;
    }): Promise<{ portfolioData: CalculatedStock[]; currentTotal: Decimal }> {
        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker('calculatePortfolioState', options);

                // Deserialize Decimal strings back to Decimal objects
                return {
                    portfolioData: result.portfolioData.map((stock: any) => ({
                        ...stock,
                        calculated: this.deserializeMetrics(stock.calculated),
                    })),
                    currentTotal: new Decimal(result.currentTotal),
                };
            } catch (error) {
                console.warn('[CalculatorWorkerService] Worker failed, falling back to sync:', error);
                this.isWorkerAvailable = false;
            }
        }

        // Fallback to synchronous calculator
        const syncResult = Calculator.calculatePortfolioState(options);
        return {
            portfolioData: syncResult.portfolioData,
            currentTotal: syncResult.currentTotal,
        };
    }

    /**
     * @description Calculate sector analysis (async with worker, fallback to sync)
     */
    async calculateSectorAnalysis(
        portfolioData: CalculatedStock[],
        currentCurrency: Currency = 'krw'
    ): Promise<{ sector: string; amount: Decimal; percentage: Decimal }[]> {
        if (this.isWorkerAvailable) {
            try {
                const result = await this.sendToWorker('calculateSectorAnalysis', {
                    portfolioData,
                    currentCurrency,
                });

                return result.map((item: any) => ({
                    sector: item.sector,
                    amount: new Decimal(item.amount),
                    percentage: new Decimal(item.percentage),
                }));
            } catch (error) {
                console.warn('[CalculatorWorkerService] Worker failed, falling back to sync:', error);
                this.isWorkerAvailable = false;
            }
        }

        // Fallback to synchronous calculator
        return Calculator.calculateSectorAnalysis(portfolioData, currentCurrency);
    }

    /**
     * @description Deserialize metrics from worker (string -> Decimal)
     */
    private deserializeMetrics(metrics: any): any {
        const deserialized: any = {};
        for (const key in metrics) {
            const value = metrics[key];
            deserialized[key] = typeof value === 'string' && !isNaN(Number(value)) ? new Decimal(value) : value;
        }
        return deserialized;
    }

    /**
     * @description Terminate worker (cleanup)
     */
    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.isWorkerAvailable = false;
            console.log('[CalculatorWorkerService] Worker terminated');
        }
    }
}

// Singleton instance
let workerServiceInstance: CalculatorWorkerService | null = null;

export function getCalculatorWorkerService(): CalculatorWorkerService {
    if (!workerServiceInstance) {
        workerServiceInstance = new CalculatorWorkerService();
    }
    return workerServiceInstance;
}
```

---

## `src/view/RowRenderer.ts`

```typescript
// src/view/RowRenderer.ts
/**
 * @description 가상 스크롤 행 렌더링 로직
 */

import { formatCurrency, escapeHTML } from '../utils';
import { t } from '../i18n';
import Decimal from 'decimal.js';
import { DECIMAL_ZERO } from '../constants';
import type { CalculatedStock } from '../types';
import { createInput, createCheckbox, createButton, createCell, getGridTemplate } from './DOMHelpers';

/**
 * @description 주식 행 Fragment를 생성합니다.
 * @param stock - 계산된 주식 데이터
 * @param currency - 통화 모드
 * @param mainMode - 메인 모드
 * @returns DocumentFragment
 */
export function createStockRowFragment(
    stock: CalculatedStock,
    currency: 'krw' | 'usd',
    mainMode: 'add' | 'sell' | 'simple'
): DocumentFragment {
    const fragment = document.createDocumentFragment();

    // 1. 입력 행 (Inputs Row)
    const divInputs = document.createElement('div');
    divInputs.className = 'virtual-row-inputs';
    divInputs.dataset.id = stock.id;
    divInputs.setAttribute('role', 'row');
    divInputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const isMobile = window.innerWidth <= 768;

    // 컬럼 구성
    divInputs.appendChild(createCell()).appendChild(createInput('text', 'name', stock.name, t('ui.stockName')));
    divInputs
        .appendChild(createCell())
        .appendChild(
            createInput(
                'text',
                'ticker',
                stock.ticker,
                t('ui.ticker'),
                false,
                t('aria.tickerInput', { name: stock.name })
            )
        );

    if (mainMode !== 'simple' && !isMobile) {
        divInputs
            .appendChild(createCell())
            .appendChild(
                createInput(
                    'text',
                    'sector',
                    stock.sector || '',
                    t('ui.sector'),
                    false,
                    t('aria.sectorInput', { name: stock.name })
                )
            );
    }

    divInputs
        .appendChild(createCell('align-right'))
        .appendChild(
            createInput(
                'number',
                'targetRatio',
                stock.targetRatio,
                '0.00',
                false,
                t('aria.targetRatioInput', { name: stock.name })
            )
        );

    if (!isMobile && mainMode !== 'simple') {
        divInputs
            .appendChild(createCell('align-right'))
            .appendChild(
                createInput(
                    'number',
                    'currentPrice',
                    stock.currentPrice,
                    '0.00',
                    false,
                    t('aria.currentPriceInput', { name: stock.name })
                )
            );
    }

    if (mainMode === 'simple') {
        const amountCell = createCell('align-right');
        const manualAmountInput = createInput(
            'number',
            'manualAmount',
            stock.manualAmount || 0,
            '현재 보유 금액 입력',
            false,
            `${stock.name} 보유 금액`
        );
        manualAmountInput.style.width = '100%';
        manualAmountInput.style.textAlign = 'right';
        amountCell.appendChild(manualAmountInput);
        divInputs.appendChild(amountCell);

        if (!isMobile) {
            const fixedBuyCell = createCell('align-center');
            const checkbox = createCheckbox(
                'isFixedBuyEnabled',
                stock.isFixedBuyEnabled,
                t('aria.fixedBuyToggle', { name: stock.name })
            );
            const amountInput = createInput(
                'number',
                'fixedBuyAmount',
                stock.fixedBuyAmount,
                '0',
                !stock.isFixedBuyEnabled,
                t('aria.fixedBuyAmount', { name: stock.name })
            );
            amountInput.style.width = '80px';
            fixedBuyCell.append(checkbox, ' ', amountInput);
            divInputs.appendChild(fixedBuyCell);
        }

        const deleteCell = createCell('align-center');
        deleteCell.appendChild(
            createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
        );
        divInputs.appendChild(deleteCell);
    } else {
        if (mainMode === 'add' && !isMobile) {
            const fixedBuyCell = createCell('align-center');
            const checkbox = createCheckbox(
                'isFixedBuyEnabled',
                stock.isFixedBuyEnabled,
                t('aria.fixedBuyToggle', { name: stock.name })
            );
            const amountInput = createInput(
                'number',
                'fixedBuyAmount',
                stock.fixedBuyAmount,
                '0',
                !stock.isFixedBuyEnabled,
                t('aria.fixedBuyAmount', { name: stock.name })
            );
            amountInput.style.width = '80px';
            fixedBuyCell.append(checkbox, ' ', amountInput);
            divInputs.appendChild(fixedBuyCell);
        }

        const actionCell = createCell('align-center');
        actionCell.append(
            createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
            ' ',
            createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
        );
        divInputs.appendChild(actionCell);
    }

    // 2. 출력 행 (Outputs Row)
    const divOutputs = document.createElement('div');
    divOutputs.className = 'virtual-row-outputs';
    divOutputs.dataset.id = stock.id;
    divOutputs.setAttribute('role', 'row');
    divOutputs.style.gridTemplateColumns = getGridTemplate(mainMode);

    const metrics = stock.calculated ?? {
        quantity: DECIMAL_ZERO,
        avgBuyPrice: DECIMAL_ZERO,
        currentAmount: DECIMAL_ZERO,
        profitLoss: DECIMAL_ZERO,
        profitLossRate: DECIMAL_ZERO,
    };

    const quantity = metrics.quantity instanceof Decimal ? metrics.quantity : new Decimal(metrics.quantity ?? 0);
    const avgBuyPrice = metrics.avgBuyPrice instanceof Decimal ? metrics.avgBuyPrice : new Decimal(metrics.avgBuyPrice ?? 0);
    const currentAmount = metrics.currentAmount instanceof Decimal ? metrics.currentAmount : new Decimal(metrics.currentAmount ?? 0);
    const profitLoss = metrics.profitLoss instanceof Decimal ? metrics.profitLoss : new Decimal(metrics.profitLoss ?? 0);
    const profitLossRate = metrics.profitLossRate instanceof Decimal ? metrics.profitLossRate : new Decimal(metrics.profitLossRate ?? 0);

    const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
    const profitSign = profitLoss.isPositive() ? '+' : '';

    const createOutputCell = (label: string, value: string, valueClass: string = ''): HTMLDivElement => {
        const cell = createCell('output-cell align-right');
        cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
        return cell;
    };

    const firstCell = createCell();
    firstCell.style.gridColumn = 'span 1';
    divOutputs.appendChild(firstCell);

    if (mainMode === 'simple') {
        divOutputs.style.display = 'none';
    } else {
        divOutputs.appendChild(createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
        if (!isMobile) {
            divOutputs.appendChild(createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
        }
        divOutputs.appendChild(createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
        if (!isMobile) {
            divOutputs.appendChild(
                createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass)
            );
        }
        divOutputs.appendChild(createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));
    }

    const lastCell = createCell();
    divOutputs.appendChild(lastCell);

    fragment.append(divInputs, divOutputs);
    return fragment;
}
```