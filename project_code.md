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
    "coverage": "vitest run --coverage"
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
    "jsdom": "^24.1.0",
    "vite": "^5.4.21",
    "vitest": "^1.6.0"
  },
  "dependencies": {
    "chart.js": "^4.5.1",
    "decimal.js": "^10.6.0"
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
        "decimal.js": "^10.6.0"
      },
      "devDependencies": {
        "jsdom": "^24.1.0",
        "vite": "^5.4.21",
        "vitest": "^1.6.0"
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
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
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
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
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
        "node": ">=12"
      }
    },
    "node_modules/@jest/schemas": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/@jest/schemas/-/schemas-29.6.3.tgz",
      "integrity": "sha512-mo5j5X+jIZmJQveBKeS/clAueipV7KgiX1vMgCxam1RNYiqE1w62n0/tJJnHtjW8ZHcQco5gY85jA3mi0L+nSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@sinclair/typebox": "^0.27.8"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@kurkle/color": {
      "version": "0.3.4",
      "resolved": "https://registry.npmjs.org/@kurkle/color/-/color-0.3.4.tgz",
      "integrity": "sha512-M5UknZPHRu3DEDWoipU6sE8PdkZ6Z/S+v4dD+Ke8IaNlpdSQah50lz1KtcFBa2vsdOnwbbnxJwVM4wty6udA5w==",
      "license": "MIT"
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
    "node_modules/@sinclair/typebox": {
      "version": "0.27.8",
      "resolved": "https://registry.npmjs.org/@sinclair/typebox/-/typebox-0.27.8.tgz",
      "integrity": "sha512-+Fj43pSMwJs4KRrH/938Uf+uAELIgVBmQzg/q1YG10djyfA3TnrU8N8XzqCh/okZdszqBQTZf96idMfE5lnwTA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
      "integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@vitest/expect": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-1.6.1.tgz",
      "integrity": "sha512-jXL+9+ZNIJKruofqXuuTClf44eSpcHlgj3CiuNihUF3Ioujtmc0zIa3UJOW5RjDK1YLBJZnWBlPuqhYycLioog==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "1.6.1",
        "@vitest/utils": "1.6.1",
        "chai": "^4.3.10"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/runner": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-1.6.1.tgz",
      "integrity": "sha512-3nSnYXkVkf3mXFfE7vVyPmi3Sazhb/2cfZGGs0JRzFsPFvAMBEcrweV1V1GsrstdXeKCTXlJbvnQwGWgEIHmOA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "1.6.1",
        "p-limit": "^5.0.0",
        "pathe": "^1.1.1"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-1.6.1.tgz",
      "integrity": "sha512-WvidQuWAzU2p95u8GAKlRMqMyN1yOJkGHnx3M1PL9Raf7AQ1kwLKg04ADlCa3+OXUZE7BceOhVZiuWAbzCKcUQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "magic-string": "^0.30.5",
        "pathe": "^1.1.1",
        "pretty-format": "^29.7.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-1.6.1.tgz",
      "integrity": "sha512-MGcMmpGkZebsMZhbQKkAf9CX5zGvjkBTqf8Zx3ApYWXr3wG+QvEu2eXWfnIIWYSJExIp4V9FCKDEeygzkYrXMw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tinyspy": "^2.2.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-1.6.1.tgz",
      "integrity": "sha512-jOrrUvXM4Av9ZWiG1EajNto0u96kWAhJ1LmPmJhXXQx/32MecEKd10pOLYgS2BQx1TgkGhloPU1ArDW2vvaY6g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "diff-sequences": "^29.6.3",
        "estree-walker": "^3.0.3",
        "loupe": "^2.3.7",
        "pretty-format": "^29.7.0"
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
    "node_modules/acorn-walk": {
      "version": "8.3.4",
      "resolved": "https://registry.npmjs.org/acorn-walk/-/acorn-walk-8.3.4.tgz",
      "integrity": "sha512-ueEepnujpqee2o5aIYnvHU6C0A42MNdsIDeqy5BydrkuC5R1ZuUFnm27EeFJGoEHJQgn3uleRvmTXaJgfXbt4g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "acorn": "^8.11.0"
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
    "node_modules/ansi-styles": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-5.2.0.tgz",
      "integrity": "sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/assertion-error": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/assertion-error/-/assertion-error-1.1.0.tgz",
      "integrity": "sha512-jgsaNduz+ndvGyFt3uSuWqvy4lCnIJiovtouQN5JZHOKCS2QuhEdbcQHFhVksz2N2U9hXJo8odG7ETyWlEeuDw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "dev": true,
      "license": "MIT"
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
      "version": "4.5.0",
      "resolved": "https://registry.npmjs.org/chai/-/chai-4.5.0.tgz",
      "integrity": "sha512-RITGBfijLkBddZvnn8jdqoTypxvqbOLYQkGGxXzeFjVHvudaPw0HNFD9x928/eUwYWd2dPCugVqspGALTZZQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "assertion-error": "^1.1.0",
        "check-error": "^1.0.3",
        "deep-eql": "^4.1.3",
        "get-func-name": "^2.0.2",
        "loupe": "^2.3.6",
        "pathval": "^1.1.1",
        "type-detect": "^4.1.0"
      },
      "engines": {
        "node": ">=4"
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
    "node_modules/check-error": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/check-error/-/check-error-1.0.3.tgz",
      "integrity": "sha512-iKEoDYaRmd1mxM90a2OEfWhjsjPpYPuQ+lMYsoxB126+t8fw7ySEO48nmDg5COTjxDI65/Y2OWpeEHk3ZOe8zg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "get-func-name": "^2.0.2"
      },
      "engines": {
        "node": "*"
      }
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
    "node_modules/confbox": {
      "version": "0.1.8",
      "resolved": "https://registry.npmjs.org/confbox/-/confbox-0.1.8.tgz",
      "integrity": "sha512-RMtmw0iFkeR4YV+fUOSucriAQNb9g8zFR52MWCtl+cCZOFRNL6zeB395vPzFhEjjn4fMxXudmELnl/KF/WrK6w==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/deep-eql": {
      "version": "4.1.4",
      "resolved": "https://registry.npmjs.org/deep-eql/-/deep-eql-4.1.4.tgz",
      "integrity": "sha512-SUwdGfqdKOwxCPeVYjwSyRpJ7Z+fhpwIAtmCUdZIWZ/YP5R9WAsyuSgpLVDi9bjWoN2LXHNss/dk3urXtdQxGg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "type-detect": "^4.0.0"
      },
      "engines": {
        "node": ">=6"
      }
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
    "node_modules/diff-sequences": {
      "version": "29.6.3",
      "resolved": "https://registry.npmjs.org/diff-sequences/-/diff-sequences-29.6.3.tgz",
      "integrity": "sha512-EjePK1srD3P08o2j4f0ExnylqRs5B9tJjcp9t1krH2qRi8CCdsYfwe9JgSLurFBWwq4uOlipzfk5fHNvwFKr8Q==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
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
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.21.5",
        "@esbuild/android-arm": "0.21.5",
        "@esbuild/android-arm64": "0.21.5",
        "@esbuild/android-x64": "0.21.5",
        "@esbuild/darwin-arm64": "0.21.5",
        "@esbuild/darwin-x64": "0.21.5",
        "@esbuild/freebsd-arm64": "0.21.5",
        "@esbuild/freebsd-x64": "0.21.5",
        "@esbuild/linux-arm": "0.21.5",
        "@esbuild/linux-arm64": "0.21.5",
        "@esbuild/linux-ia32": "0.21.5",
        "@esbuild/linux-loong64": "0.21.5",
        "@esbuild/linux-mips64el": "0.21.5",
        "@esbuild/linux-ppc64": "0.21.5",
        "@esbuild/linux-riscv64": "0.21.5",
        "@esbuild/linux-s390x": "0.21.5",
        "@esbuild/linux-x64": "0.21.5",
        "@esbuild/netbsd-x64": "0.21.5",
        "@esbuild/openbsd-x64": "0.21.5",
        "@esbuild/sunos-x64": "0.21.5",
        "@esbuild/win32-arm64": "0.21.5",
        "@esbuild/win32-ia32": "0.21.5",
        "@esbuild/win32-x64": "0.21.5"
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
    "node_modules/execa": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/execa/-/execa-8.0.1.tgz",
      "integrity": "sha512-VyhnebXciFV2DESc+p6B+y0LjSm0krU4OgJN44qFAhBY0TJ+1V61tYD2+wHusZ6F9n5K+vl8k0sTy7PEfV4qpg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cross-spawn": "^7.0.3",
        "get-stream": "^8.0.1",
        "human-signals": "^5.0.0",
        "is-stream": "^3.0.0",
        "merge-stream": "^2.0.0",
        "npm-run-path": "^5.1.0",
        "onetime": "^6.0.0",
        "signal-exit": "^4.1.0",
        "strip-final-newline": "^3.0.0"
      },
      "engines": {
        "node": ">=16.17"
      },
      "funding": {
        "url": "https://github.com/sindresorhus/execa?sponsor=1"
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
    "node_modules/get-func-name": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/get-func-name/-/get-func-name-2.0.2.tgz",
      "integrity": "sha512-8vXOvuE167CtIc3OyItco7N/dpRtBbYOsPsXCz7X/PMnlGjYjSGuZJgM1Y7mmew7BKf9BqvLX2tnOVy1BBUsxQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
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
    "node_modules/get-stream": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-8.0.1.tgz",
      "integrity": "sha512-VaUJspBffn/LMCJVoMvSAdmscJyS1auj5Zulnn5UoYcY531UWmdwhRWkcGKnGU93m5HSXP9LP2usOryrBtQowA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=16"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
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
    "node_modules/human-signals": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/human-signals/-/human-signals-5.0.0.tgz",
      "integrity": "sha512-AXcZb6vzzrFAUE61HnN4mpLqd/cSIwNQjtNWR0euPm6y0iqx3G4gOXaIDdtdDwZmhwe82LA6+zinmW4UBWVePQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=16.17.0"
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
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/is-stream": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-stream/-/is-stream-3.0.0.tgz",
      "integrity": "sha512-LnQR4bZ9IADDRSkvpqMGvt/tEJWclzklNgSw48V5EAaAeDd6qGvN8ei6k5p0tvxSR171VmGyHuTiAOfxAbr8kA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/js-tokens": {
      "version": "9.0.1",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-9.0.1.tgz",
      "integrity": "sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/local-pkg": {
      "version": "0.5.1",
      "resolved": "https://registry.npmjs.org/local-pkg/-/local-pkg-0.5.1.tgz",
      "integrity": "sha512-9rrA30MRRP3gBD3HTGnC6cDFpaE1kVDWxWgqWJUN0RvDNAo+Nz/9GxB+nHOH0ifbVFy0hSA1V6vFDvnx54lTEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mlly": "^1.7.3",
        "pkg-types": "^1.2.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antfu"
      }
    },
    "node_modules/loupe": {
      "version": "2.3.7",
      "resolved": "https://registry.npmjs.org/loupe/-/loupe-2.3.7.tgz",
      "integrity": "sha512-zSMINGVYkdpYSOBmLi0D1Uo7JU9nVdQKrHxC8eYlV+9YKK9WePqAlL7lSlorG/U2Fw1w0hTBmaa/jrQ3UbPHtA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "get-func-name": "^2.0.1"
      }
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
    "node_modules/merge-stream": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-stream/-/merge-stream-2.0.0.tgz",
      "integrity": "sha512-abv/qOcuPfk3URPfDzmZU1LKmuw8kT+0nIHvKrKgFrwifol/doWcdA4ZqsWQ8ENrFKkd67Mfpo/LovbIUsbt3w==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/mimic-fn": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/mimic-fn/-/mimic-fn-4.0.0.tgz",
      "integrity": "sha512-vqiC06CuhBTUdZH+RYl8sFrL096vA45Ok5ISO6sE/Mr1jRbGH4Csnhi8f3wKVl7x8mO4Au7Ir9D3Oyv1VYMFJw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
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
    "node_modules/mlly/node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/nanoid": {
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
    "node_modules/npm-run-path": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/npm-run-path/-/npm-run-path-5.3.0.tgz",
      "integrity": "sha512-ppwTtiJZq0O/ai0z7yfudtBpWIoxM8yE6nHi1X47eFR2EWORqfbu6CnPlNsjeN683eT0qG6H/Pyf9fCcvjnnnQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "path-key": "^4.0.0"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/npm-run-path/node_modules/path-key": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-4.0.0.tgz",
      "integrity": "sha512-haREypq7xkM7ErfgIyA0z+Bj4AGKlMSdlQE2jvJo6huWD1EdkKYV+G/T4nq0YEF2vgTT8kqMFKo1uHn950r4SQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/nwsapi": {
      "version": "2.2.22",
      "resolved": "https://registry.npmjs.org/nwsapi/-/nwsapi-2.2.22.tgz",
      "integrity": "sha512-ujSMe1OWVn55euT1ihwCI1ZcAaAU3nxUiDwfDQldc51ZXaB9m2AyOn6/jh1BLe2t/G8xd6uKG1UBF2aZJeg2SQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/onetime": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/onetime/-/onetime-6.0.0.tgz",
      "integrity": "sha512-1FlR+gjXK7X+AsAHso35MnyN5KqGwJRi/31ft6x0M194ht7S+rWAvd7PHss9xSKMzE0asv1pyIHaJYq+BbacAQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mimic-fn": "^4.0.0"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/p-limit": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-5.0.0.tgz",
      "integrity": "sha512-/Eaoq+QyLSiXQ4lyYV23f14mZRQcXnxfHrN0vCai+ak9G0pp9iEQukIIZq5NccEvwRB8PUnZT0KsOoDCINS1qQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "yocto-queue": "^1.0.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
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
    "node_modules/pathe": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-1.1.2.tgz",
      "integrity": "sha512-whLdWMYL2TwI08hn8/ZqAbrVemu0LNaNNJZX73O6qaIdCTfXutsLhMkjdENX0qhsQ9uIimo4/aQOmXkoon2nDQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/pathval": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/pathval/-/pathval-1.1.1.tgz",
      "integrity": "sha512-Dp6zGqpTdETdR63lehJYPeIOqpiNBNtc7BpWSLrOje7UaIsE5aY92r/AunQA7rsXvet3lrJ3JnZX29UPTKXyKQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
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
    "node_modules/pkg-types/node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/pretty-format": {
      "version": "29.7.0",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-29.7.0.tgz",
      "integrity": "sha512-Pdlw/oPxN+aXdmM9R00JVC9WVFoCLTKJvDVLgmJ+qAffBMxsV85l/Lu7sNx4zSzPyoL2euImuEwHhOXdEgNFZQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jest/schemas": "^29.6.3",
        "ansi-styles": "^5.0.0",
        "react-is": "^18.0.0"
      },
      "engines": {
        "node": "^14.15.0 || ^16.10.0 || >=18.0.0"
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
    "node_modules/querystringify": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/querystringify/-/querystringify-2.2.0.tgz",
      "integrity": "sha512-FIqgj2EUvTa7R50u0rGsyTftzjYmv/a3hO345bZNrqabNqjtgiDMgmo4mkUjd+nzU5oF3dClKqFIPUKybUyqoQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/react-is": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-18.3.1.tgz",
      "integrity": "sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/requires-port": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/requires-port/-/requires-port-1.0.0.tgz",
      "integrity": "sha512-KigOCHcocU3XODJxsu8i/j8T9tzT4adHiecwORRQ0ZZFcp7ahwXuRU1m+yuO90C5ZUyGeGfocHDI14M3L3yDAQ==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/strip-final-newline": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/strip-final-newline/-/strip-final-newline-3.0.0.tgz",
      "integrity": "sha512-dOESqjYr96iWYylGObzd39EuNTa5VJxyvVAEm5Jnh7KGo75V43Hk1odPQkNDyXNmUR6k+gEiDVXnjB8HJ3crXw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/strip-literal": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/strip-literal/-/strip-literal-2.1.1.tgz",
      "integrity": "sha512-631UJ6O00eNGfMiWG78ck80dfBab8X6IVFB51jZK5Icd7XAs60Z5y7QdSd/wGIklnWvRbUNloVzhOKKmutxQ6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^9.0.1"
      },
      "funding": {
        "url": "https://github.com/sponsors/antfu"
      }
    },
    "node_modules/symbol-tree": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinybench": {
      "version": "2.9.0",
      "resolved": "https://registry.npmjs.org/tinybench/-/tinybench-2.9.0.tgz",
      "integrity": "sha512-0+DUvqWMValLmha6lr4kD8iAMK1HzV0/aKnCtWb9v9641TnP/MFb7Pc2bxoxQjTXAErryXVgUOfv2YqNllqGeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tinypool": {
      "version": "0.8.4",
      "resolved": "https://registry.npmjs.org/tinypool/-/tinypool-0.8.4.tgz",
      "integrity": "sha512-i11VH5gS6IFeLY3gMBQ00/MmLncVP7JLXOw1vlgkytLmJK7QnEr7NXf0LBdxfmNPAeyetukOk0bOYrJrFGjYJQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tinyspy": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/tinyspy/-/tinyspy-2.2.1.tgz",
      "integrity": "sha512-KYad6Vy5VDWV4GH3fjpseMQ/XU2BhIYP7Vzd0LG44qRWm/Yt2WCOTicFdvmgo6gWaqooMQCawTtILVQJupKu7A==",
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
    "node_modules/type-detect": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/type-detect/-/type-detect-4.1.0.tgz",
      "integrity": "sha512-Acylog8/luQ8L7il+geoSxhEkazvkslg7PSNKOX59mbB9cOveP5aq9h74Y7YU8yDpJwetzQQrfIwtf4Wp4LKcw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/ufo": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/ufo/-/ufo-1.6.1.tgz",
      "integrity": "sha512-9a4/uxlTWJ4+a5i0ooc1rU7C7YOw3wT+UGqdeNNHWnOF9qcMBgLRS+4IYUqbczewFx4mLEig6gawh7X6mFlEkA==",
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
    "node_modules/vite": {
      "version": "5.4.21",
      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.21.3",
        "postcss": "^8.4.43",
        "rollup": "^4.20.0"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || >=20.0.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.4.0"
      },
      "peerDependenciesMeta": {
        "@types/node": {
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
        }
      }
    },
    "node_modules/vite-node": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/vite-node/-/vite-node-1.6.1.tgz",
      "integrity": "sha512-YAXkfvGtuTzwWbDSACdJSg4A4DZiAqckWe90Zapc/sEX3XvHcw1NdurM/6od8J207tSDqNbSsgdCacBgvJKFuA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "cac": "^6.7.14",
        "debug": "^4.3.4",
        "pathe": "^1.1.1",
        "picocolors": "^1.0.0",
        "vite": "^5.0.0"
      },
      "bin": {
        "vite-node": "vite-node.mjs"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/vitest": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-1.6.1.tgz",
      "integrity": "sha512-Ljb1cnSJSivGN0LqXd/zmDbWEM0RNNg2t1QW/XUhYl/qPqyu7CsqeWtqQXHVaJsecLPuDoak2oJcZN2QoRIOag==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "1.6.1",
        "@vitest/runner": "1.6.1",
        "@vitest/snapshot": "1.6.1",
        "@vitest/spy": "1.6.1",
        "@vitest/utils": "1.6.1",
        "acorn-walk": "^8.3.2",
        "chai": "^4.3.10",
        "debug": "^4.3.4",
        "execa": "^8.0.1",
        "local-pkg": "^0.5.0",
        "magic-string": "^0.30.5",
        "pathe": "^1.1.1",
        "picocolors": "^1.0.0",
        "std-env": "^3.5.0",
        "strip-literal": "^2.0.0",
        "tinybench": "^2.5.1",
        "tinypool": "^0.8.3",
        "vite": "^5.0.0",
        "vite-node": "1.6.1",
        "why-is-node-running": "^2.2.2"
      },
      "bin": {
        "vitest": "vitest.mjs"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      },
      "peerDependencies": {
        "@edge-runtime/vm": "*",
        "@types/node": "^18.0.0 || >=20.0.0",
        "@vitest/browser": "1.6.1",
        "@vitest/ui": "1.6.1",
        "happy-dom": "*",
        "jsdom": "*"
      },
      "peerDependenciesMeta": {
        "@edge-runtime/vm": {
          "optional": true
        },
        "@types/node": {
          "optional": true
        },
        "@vitest/browser": {
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
    },
    "node_modules/yocto-queue": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/yocto-queue/-/yocto-queue-1.2.1.tgz",
      "integrity": "sha512-AyeEbWOu/TAXdxlV9wmGcR0+yh2j3vYPGOECcIj2S7MkrLyC7ne+oye2BKTItt0ii2PHk4cDy+95+LshzbXnGg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.20"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    }
  }
}
```

---

## `jsconfig.json`

```json
// jsconfig.json (새 파일)
{
  "compilerOptions": {
    "checkJs": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node"
  },
  "include": ["js/**/*.js"]
}
```

---

## `vite.config.js`

```javascript
// vite.config.js (Vitest 4.x용 단순화 버전)

import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',

    esbuild: {
      target: 'esnext', // # 문법 지원은 유지
    },

    test: {
      globals: true,
      environment: 'jsdom',
      include: ['js/**/*.test.js'],
      // pool, threads, deps.optimizer 등 제거
    },

    server: {
      proxy: {
        '/finnhub': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/finnhub/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const url = new URL(proxyReq.path, options.target);
              url.searchParams.set('token', env.VITE_FINNHUB_API_KEY);
              proxyReq.path = url.pathname + url.search;
            });
          }
        }
      }
    }
  }
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
    <button id="darkModeToggle" class="btn dark-mode-toggle" aria-label="다크 모드 전환">🌙</button>
    <div class="container">
        <header class="header">
            <h1>📊 포트폴리오 리밸런싱 계산기</h1>
            <p>목표 비율에 맞춰 포트폴리오를 조정하는 최적의 방법을 계산합니다.</p>
        </header>

        <main>
            <section class="card">
                <h2>📁 포트폴리오 관리</h2>
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

            <section class="card">
                <h2>⚙️ 계산 모드 선택</h2>
                <div class="mode-selector">
                    <label for="modeAdd"><input type="radio" name="mainMode" value="add" id="modeAdd" checked> ➕ 추가 매수 모드</label>
                    <label for="modeSell"><input type="radio" name="mainMode" value="sell" id="modeSell"> ⚖️ 매도 리밸런싱 모드</label>
                </div>
            </section>

            <section class="card">
                <h2>💼 현재 포트폴리오 설정</h2>
                <div class="btn-controls">
                    <button id="addNewStockBtn" class="btn" data-variant="green">➕ 새 종목 추가</button>
                    <button id="fetchAllPricesBtn" class="btn" data-variant="blue" style="width: 100%;">📈 현재가 모두 불러오기</button>
                    
                    <button id="resetDataBtn" class="btn" data-variant="orange">🔄 초기화</button>
                    <button id="normalizeRatiosBtn" class="btn" data-variant="blue">⚖️ 비율 자동 맞춤(100%)</button>
                    
                    <div class="dropdown">
                        <button id="dataManagementBtn" class="btn" data-variant="grey">💾 데이터 관리</button>
                        <div id="dataDropdownContent" class="dropdown-content">
                            <a href="#" id="exportDataBtn">📤 내보내기 (JSON)</a>
                            <a href="#" id="importDataBtn">📥 가져오기 (JSON)</a>
                        </div>
                    </div>

                    <input type="file" id="importFileInput" accept=".json" style="display: none;">
                </div>
                <div class="table-responsive">
                    <table id="portfolioTable" role="grid">
                        <thead id="portfolioTableHead"></thead>
                        <tbody id="portfolioBody"></tbody>
                    </table>
                </div>
                <div id="ratioValidator" class="ratio-validator">
                    <strong>목표 비율 합계:</strong>
                    <span class="ratio-value" id="ratioSum" aria-live="polite">0%</span>
                </div>
            </section>

            <section id="addInvestmentCard" class="card">
                <h2>💰 추가 투자금 계산</h2>
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
            
            <section id="resultsSection" class="hidden" aria-live="polite"></section>
            <section id="sectorAnalysisSection" class="hidden"></section>
            <section id="chartSection" class="card hidden">
                <h2>📊 포트폴리오 시각화</h2>
                <div>
                    <canvas id="portfolioChart"></canvas>
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
                    <tbody id="transactionListBody"></tbody>
                </table>
            </div>

            <form id="newTransactionForm">
                <h3>새 거래 추가</h3>
                <div class="mode-selector" style="margin-bottom: 15px;">
                    <label><input type="radio" name="txType" value="buy" checked> 매수</label>
                    <label><input type="radio" name="txType" value="sell"> 매도</label>
                </div>
                <div class="input-grid">
                    <div class="input-group-vertical">
                        <label for="txDate">날짜</label>
                        <input type="date" id="txDate" required>
                    </div>
                    <div class="input-group-vertical">
                        <label for="txQuantity">수량</label>
                        <input type="number" id="txQuantity" placeholder="예: 10" min="0" step="any" required>
                    </div>
                    <div class="input-group-vertical">
                        <label for="txPrice">단가</label>
                        <input type="number" id="txPrice" placeholder="예: 150000" min="0" step="any" required>
                    </div>
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

    <script type="module" src="/js/main.js"></script>
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

/* --- 입력 필드 및 버튼 --- */
.input-group { display: flex; align-items: center; gap: 15px; margin-bottom: var(--spacing-md); flex-wrap: wrap; }
.input-group label { font-weight: 600; min-width: 120px; }
.input-group-vertical { display: flex; flex-direction: column; gap: 5px; }
.input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
input, .input-group__select {
    padding: 12px; border: 2px solid var(--input-border); border-radius: 8px; font-size: var(--font-size-base); 
    background: var(--input-bg); color: var(--text-color); transition: border-color 0.3s; 
}
#portfolioTable input[type="text"] { text-align: center; }
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
    table { font-size: 0.85rem; min-width: auto; }
    th, td { padding: 8px 4px; white-space: normal; }
    .amount-input { width: 80px; }
    .input-group { flex-direction: column; align-items: flex-start; }
    .summary-grid { grid-template-columns: 1fr; }
    .mode-selector { flex-direction: column; gap: var(--spacing-sm); }
    .guide-box { padding: 15px; }
    .dark-mode-toggle { bottom: 15px; right: 15px; width: 50px; height: 50px; }
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

## `js/main.js`

```javascript
import { PortfolioController } from './controller.js';

// DOM이 완전히 로드된 후 애플리케이션 초기화
window.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new PortfolioController();
        app.init();
    } catch (error) {
        console.error("애플리케이션 초기화 중 치명적인 오류 발생:", error);
        // 사용자에게 오류 메시지를 보여주는 UI 로직 (예: alert 또는 DOM 조작)
        document.body.innerHTML = `<h1>애플리케이션을 로드하는 데 실패했습니다. 콘솔을 확인해주세요.</h1>`;
    }
});
```

---

## `js/types.js`

```javascript
// js/types.js (새 파일)

/**
 * @typedef {import('decimal.js').Decimal} Decimal
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - 거래 고유 ID
 * @property {'buy' | 'sell'} type - 거래 유형
 * @property {string} date - 거래 날짜 (YYYY-MM-DD)
 * @property {number} quantity - 수량
 * @property {number} price - 단가
 */

/**
 * @typedef {Object} Stock
 * @property {string} id - 주식 고유 ID
 * @property {string} name - 종목명
 * @property {string} ticker - 티커
 * @property {string} sector - 섹터
 * @property {number} targetRatio - 목표 비율 (%)
 * @property {number} currentPrice - 현재가
 * @property {Transaction[]} transactions - 거래 내역 배열
 * @property {boolean} isFixedBuyEnabled - 고정 매수 활성화 여부
 * @property {number} fixedBuyAmount - 고정 매수 금액
 */

/**
 * @typedef {Object} CalculatedStockMetrics
 * @property {Decimal} quantity - 현재 보유 수량
 * @property {Decimal} avgBuyPrice - 평균 매수 단가
 * @property {Decimal} currentAmount - 현재 평가 금액
 * @property {Decimal} profitLoss - 평가 손익
 * @property {Decimal} profitLossRate - 평가 수익률 (%)
 */

/**
 * @typedef {Stock & { calculated: CalculatedStockMetrics }} CalculatedStock
 */

/**
 * @typedef {Object} PortfolioData
 * @property {string} name - 포트폴리오 이름
 * @property {Stock[]} portfolioData - 주식 데이터 배열
 * @property {Object} settings
 * @property {'add' | 'sell'} settings.mainMode - 계산 모드
 * @property {'krw' | 'usd'} settings.currentCurrency - 통화
 */

// 이 파일은 타입을 정의하는 파일이므로, export는 필요 없습니다.
```

---

## `js/calculator.js`

```javascript
// @ts-check
import Decimal from 'decimal.js'; // 동기 임포트로 복구
import { CONFIG } from './constants.js';
import { ErrorService } from './errorService.js';

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

/**
 * @description 주식 ID와 현재 가격의 조합을 기반으로 캐시 키를 생성합니다.
 * 이 키는 calculateStockMetrics의 입력이 변경되지 않았는지 확인하는 데 사용됩니다.
 * @param {Stock} stock - 주식 객체
 * @returns {string} 캐시 키
 */
function _generateStockKey(stock) {
    // transactions는 state.js에서 정렬되어 관리되므로, 단순히 배열의 길이와 마지막 거래 정보를 포함
    const lastTx = stock.transactions[stock.transactions.length - 1];
    const txSignature = lastTx ? `${lastTx.type}-${lastTx.quantity.toString()}-${lastTx.price.toString()}` : 'none';
    
    // 섹터 정보도 계산에 영향을 주지 않으므로 제외
    return `${stock.id}:${stock.currentPrice}:${stock.transactions.length}:${txSignature}`;
}

/**
 * @description 포트폴리오 전체를 위한 캐시 키를 생성합니다.
 * @param {Stock[]} portfolioData - 포트폴리오 데이터
 * @returns {string} 캐시 키
 */
function _generatePortfolioKey(portfolioData) {
    return portfolioData.map(_generateStockKey).join('|');
}

/**
 * @typedef {object} PortfolioCalculationResult
 * @property {CalculatedStock[]} portfolioData - 계산된 주식 데이터 배열
 * @property {Decimal} currentTotal - 현재 총 자산 가치
 * @property {string} cacheKey - 사용된 캐시 키
 */

/**
 * @typedef {object} CalculatorCache
 * @property {string} key - 캐시 키
 * @property {PortfolioCalculationResult} result - 계산 결과
 */

export const Calculator = {
    /** @type {CalculatorCache | null} */
    #cache: null,

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @param {Stock} stock - 계산할 주식 객체
     * @returns {CalculatedStock['calculated']} 계산 결과 객체
     */
    calculateStockMetrics(stock) {
        try {
            const result = {
                totalBuyQuantity: new Decimal(0),
                totalSellQuantity: new Decimal(0),
                netQuantity: new Decimal(0),
                totalBuyAmount: new Decimal(0),
                currentAmount: new Decimal(0),
                currentAmountUSD: new Decimal(0),
                currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0),
                profitLoss: new Decimal(0),
                profitLossRate: new Decimal(0),
            };

            const currentPrice = new Decimal(stock.currentPrice || 0);

            // 1. 매수/매도 수량 및 금액 합산
            for (const tx of stock.transactions) {
                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(tx.quantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(tx.quantity.times(tx.price));
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(tx.quantity);
                }
            }

            // 2. 순 보유 수량
            result.netQuantity = result.totalBuyQuantity.minus(result.totalSellQuantity);

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 현재 가치 (netQuantity * currentPrice)
            result.currentAmount = result.netQuantity.times(currentPrice);

            // 5. 손익 계산 (currentAmount - (netQuantity * avgBuyPrice))
            const originalCostOfHolding = result.netQuantity.times(result.avgBuyPrice);
            result.profitLoss = result.currentAmount.minus(originalCostOfHolding);

            // 6. 손익률
            if (originalCostOfHolding.isZero()) {
                result.profitLossRate = new Decimal(0);
            } else {
                result.profitLossRate = result.profitLoss.div(originalCostOfHolding).times(100);
            }

            return result;

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'calculateStockMetrics');
            // 에러 발생 시 기본값 반환
            return {
                totalBuyQuantity: new Decimal(0), totalSellQuantity: new Decimal(0), netQuantity: new Decimal(0),
                totalBuyAmount: new Decimal(0), currentAmount: new Decimal(0), currentAmountUSD: new Decimal(0), currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0), profitLoss: new Decimal(0), profitLossRate: new Decimal(0),
            };
        }
    },

    /**
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
     * @param {{ portfolioData: Stock[], exchangeRate: number, currentCurrency: 'KRW' | 'USD' }} options - 포트폴리오 데이터 및 환율/통화
     * @returns {PortfolioCalculationResult}
     */
    calculatePortfolioState({ portfolioData, exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE, currentCurrency = 'KRW' }) {
        const cacheKey = _generatePortfolioKey(portfolioData);

        if (this.#cache && this.#cache.key === cacheKey) {
            return this.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = new Decimal(0);

        /** @type {CalculatedStock[]} */
        const calculatedPortfolioData = portfolioData.map(stock => {
            const calculatedMetrics = this.calculateStockMetrics(stock);
            
            // 현재가치를 KRW와 USD로 변환
            if (currentCurrency === 'KRW') {
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else { // USD
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount.times(exchangeRateDec);
            }

            // Calculate total based on the selected currency
            currentTotal = currentTotal.plus(calculatedMetrics.currentAmount);

            return { ...stock, calculated: calculatedMetrics };
        });

        /** @type {PortfolioCalculationResult} */
        const result = {
            portfolioData: calculatedPortfolioData,
            currentTotal: currentTotal,
            cacheKey: cacheKey
        };
        
        // 캐시 업데이트
        this.#cache = { key: cacheKey, result: result };

        return result;
    },

    /**
     * @description '추가 매수' 모드의 리밸런싱을 계산합니다.
     * @param {{ portfolioData: CalculatedStock[], additionalInvestment: Decimal }} options - 계산된 데이터, 추가 투자금 (현재 통화 기준)
     * @returns {{ results: (CalculatedStock & { currentRatio: Decimal, finalBuyAmount: Decimal, buyRatio: Decimal })[] }}
     */
    calculateAddRebalancing({ portfolioData, additionalInvestment }) {
        const totalInvestment = portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0)).plus(additionalInvestment);
        const results = [];

        // 1. 목표 비율 합계 및 고정 매수 금액 합계 계산
        let totalRatio = new Decimal(0);
        let totalFixedBuy = new Decimal(0);
        for (const s of portfolioData) {
            totalRatio = totalRatio.plus(s.targetRatio || 0);
            if (s.isFixedBuyEnabled) {
                totalFixedBuy = totalFixedBuy.plus(s.fixedBuyAmount || 0);
            }
        }
        
        let remainingInvestment = additionalInvestment;
        
        // 2. 고정 매수 금액 먼저 처리 (남은 금액 업데이트)
        /** @type {Decimal} */
        const zero = new Decimal(0);
        
        for (const s of portfolioData) {
            /** @type {Decimal} */
            let buyAmount = zero;

            if (s.isFixedBuyEnabled) {
                const fixedAmountDec = new Decimal(s.fixedBuyAmount || 0);
                // 추가 투자금이 충분할 때만 고정 매수 처리
                if (remainingInvestment.greaterThanOrEqualTo(fixedAmountDec)) {
                    buyAmount = fixedAmountDec;
                    remainingInvestment = remainingInvestment.minus(fixedAmountDec);
                } else {
                    // 고정 매수 처리 불가능 (Validator에서 이미 체크됨)
                    buyAmount = remainingInvestment;
                    remainingInvestment = zero;
                }
            }

            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero() ? zero : currentAmount.div(totalInvestment).times(100);

            // 초기 결과 객체 생성
            results.push({
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: buyAmount,
                buyRatio: zero // 임시
            });
        }
        
        // 3. 목표 비율 기반 추가 배분
        const ratioMultiplier = totalRatio.isZero() ? zero : new Decimal(100).div(totalRatio);

        // 목표 금액 계산
        const targetAmounts = results.map(s => {
            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            return {
                id: s.id,
                targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
                currentAmount: s.calculated?.currentAmount || zero,
                adjustmentAmount: zero // 임시
            };
        });
        
        // 4. 리밸런싱 부족분 계산
        const adjustmentTargets = targetAmounts.map(t => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(results.find(s => s.id === t.id)?.finalBuyAmount || zero);
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return {
                ...t,
                deficit: deficit.greaterThan(zero) ? deficit : zero,
            };
        }).filter(t => t.deficit.greaterThan(zero)); // 부족분 있는 종목만

        const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);
        
        // 5. 남은 투자금 배분 (Deficit 비율에 따라)
        if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
            for (const target of adjustmentTargets) {
                const ratio = target.deficit.div(totalDeficit);
                const allocatedAmount = remainingInvestment.times(ratio);
                
                // 최종 매수 금액 업데이트
                const resultItem = results.find(r => r.id === target.id);
                if (resultItem) {
                    resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
                }
            }
        }

        // 6. 최종 비율 계산 (buyRatio)
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);

        const finalResults = results.map(s => {
            const buyRatio = totalBuyAmount.isZero() ? zero : s.finalBuyAmount.div(totalBuyAmount).times(100);
            return {
                ...s,
                buyRatio: buyRatio,
            };
        });

        return { results: finalResults };
    },

    /**
     * @description '매도 리밸런싱' 모드의 조정을 계산합니다. (현금 유입/유출은 없음)
     * @param {{ portfolioData: CalculatedStock[] }} options - 계산된 데이터
     * @returns {{ results: (CalculatedStock & { currentRatio: number, targetRatioNum: number, adjustment: Decimal })[] }}
     */
    calculateSellRebalancing({ portfolioData }) {
        const currentTotal = portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0));
        const totalRatio = portfolioData.reduce((sum, s) => sum + (s.targetRatio || 0), 0);
        const results = [];
        const zero = new Decimal(0);

        if (currentTotal.isZero() || totalRatio === 0) {
            return { results: [] };
        }
        
        // 정규화된 목표 비율 승수
        const ratioMultiplier = new Decimal(100).div(totalRatio);

        for (const s of portfolioData) {
            const currentAmount = s.calculated?.currentAmount || zero;
            
            // 현재 비율 계산
            const currentRatioDec = currentAmount.div(currentTotal).times(100);
            const currentRatio = currentRatioDec.toNumber();

            // 목표 비율 계산 (정규화된 목표 비율 사용)
            const targetRatioNum = s.targetRatio || 0;
            const targetRatioNormalized = new Decimal(targetRatioNum).times(ratioMultiplier);

            // 목표 금액 계산
            const targetAmount = currentTotal.times(targetRatioNormalized.div(100));

            // 조정 금액 (매도: 양수, 매수: 음수)
            // currentAmount - targetAmount
            const adjustment = currentAmount.minus(targetAmount);

            results.push({
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(), // 정규화된 비율
                adjustment: adjustment
            });
        }

        return { results };
    },

    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     * @param {CalculatedStock[]} portfolioData - 계산된 주식 데이터
     * @returns {{ sector: string, amount: Decimal, percentage: Decimal }[]} 섹터 분석 결과
     */
    calculateSectorAnalysis(portfolioData) {
        /** @type {Map<string, Decimal>} */
        const sectorMap = new Map();
        let currentTotal = new Decimal(0);

        for (const s of portfolioData) {
            const sector = s.sector || 'Unclassified';
            const amount = s.calculated?.currentAmount || new Decimal(0);
            currentTotal = currentTotal.plus(amount);

            const currentSectorAmount = sectorMap.get(sector) || new Decimal(0);
            sectorMap.set(sector, currentSectorAmount.plus(amount));
        }

        /** @type {{ sector: string, amount: Decimal, percentage: Decimal }[]} */
        const result = [];
        for (const [sector, amount] of sectorMap.entries()) {
            const percentage = currentTotal.isZero() ? new Decimal(0) : amount.div(currentTotal).times(100);
            result.push({ sector, amount, percentage });
        }

        // 금액 내림차순 정렬
        result.sort((a, b) => b.amount.comparedTo(a.amount));

        return result;
    },

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    clearPortfolioStateCache() {
        this.#cache = null;
    }
};
```

---

## `js/constants.js`

```javascript
// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000, // 매수 추천 최소 금액 (이 금액 미만은 추천 목록에서 제외될 수 있음)
    DEFAULT_EXCHANGE_RATE: 1300, // 기본 환율 값
    RATIO_TOLERANCE: 0.01, // 목표 비율 합계가 100%에서 벗어나도 허용하는 오차 범위 (%)
    META_KEY: 'portfolioCalculatorMeta_v1', // localStorage에 설정(활성 ID 등) 저장 시 사용할 키
    DATA_PREFIX: 'portfolioCalculatorData_v1_', // localStorage에 개별 포트폴리오 데이터 저장 시 사용할 접두사
    DARK_MODE_KEY: 'darkMode' // localStorage에 다크 모드 설정 저장 시 사용할 키
};
```

---

## `js/utils.js`

```javascript
// @ts-check
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('decimal.js').Decimal} Decimal */ // 타입 정의는 유지
/** @typedef {import('./types.js').Stock} Stock */ // Stock 타입 추가

/**
 * HTML 문자열을 이스케이프하여 XSS 공격을 방지합니다.
 * @param {string | number | null | undefined} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 안전한 HTML 문자열
 */
export function escapeHTML(str) {
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
 * @param {Stock[]} portfolioData - 포트폴리오 주식 객체 배열
 * @returns {Decimal} 목표 비율 합계
 */
export function getRatioSum(portfolioData) {
    let sum = new Decimal(0); // Decimal 생성은 동기
    if (!Array.isArray(portfolioData)) return sum;

    for (const s of portfolioData) {
        // targetRatio가 숫자 타입임을 보장하고 Decimal 생성
        const ratio = new Decimal(s.targetRatio || 0);
        sum = sum.plus(ratio);
    }
    return sum;
}

/**
 * @description 숫자를 통화 형식의 문자열로 변환합니다. (null, undefined, Decimal 객체 안전 처리)
 * @param {number|Decimal|string|null|undefined} amount - 변환할 금액
 * @param {string} currency - 통화 코드 ('KRW', 'USD')
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount, currency = 'KRW') {
    try {
        let num;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) { // Check if it's Decimal-like
            // @ts-ignore
            num = amount.toNumber(); // This is synchronous
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const options = {
            style: 'currency',
            currency: currency,
        };

        if (currency.toUpperCase() === 'KRW') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else { // USD and others
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }
        return new Intl.NumberFormat(currency.toUpperCase() === 'USD' ? 'en-US' : 'ko-KR', options).format(num);
    } catch (e) {
        console.error("formatCurrency error:", e);
        return String(amount); // 에러 발생 시 원본 값 문자열로 반환
    }
}

/**
 * @description 함수 실행을 지연시키는 디바운스 함수를 생성합니다.
 * @param {Function} func - 디바운싱을 적용할 함수
 * @param {number} [delay=300] - 지연 시간 (ms)
 * @param {boolean} [immediate=false] - 첫 이벤트 시 즉시 실행할지 여부
 * @returns {Function} 디바운싱이 적용된 새로운 함수
 */
export function debounce(func, delay = 300, immediate = false) { // immediate 옵션 추가
    let timeoutId;
    return function(...args) {
        const context = this; // 'this' 컨텍스트 저장
        const callNow = immediate && !timeoutId; // 즉시 실행 조건 확인
        // @ts-ignore
        clearTimeout(timeoutId); // 기존 타이머 취소
        timeoutId = setTimeout(() => {
            timeoutId = null; // 타이머 완료 후 ID 초기화
            if (!immediate) func.apply(context, args); // immediate가 false면 지연 후 실행
        }, delay);
        if (callNow) func.apply(context, args); // 즉시 실행 조건 충족 시 바로 실행
    };
}
```

---

## `js/templates.js`

```javascript
// js/templates.js
// @ts-check
import { escapeHTML, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('decimal.js').Decimal} Decimal */

/**
 * @description '추가 매수' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param {(CalculatedStock & { currentRatio: Decimal, finalBuyAmount: Decimal, buyRatio: Decimal })[]} results - 계산 결과 배열
 * @param {{ currentTotal: Decimal, additionalInvestment: Decimal, finalTotal: Decimal }} summary - 요약 정보 객체
 * @param {string} currency - 현재 통화 ('KRW' or 'USD')
 * @returns {string} 생성된 HTML 문자열
 */
export function generateAddModeResultsHTML(results, summary, currency) {
    if (!results) return ''; // Null check for results

    const sortedResults = [...results].sort((a, b) => {
        // Ensure finalBuyAmount exists before comparing
        const amountA = a.finalBuyAmount ?? new Decimal(0);
        const amountB = b.finalBuyAmount ?? new Decimal(0);
        return amountB.comparedTo(amountA);
    });
    const resultsRows = sortedResults.map((stock, index) => {
        // Ensure calculated exists
        const metrics = stock.calculated ?? { profitLoss: new Decimal(0), profitLossRate: new Decimal(0) };
        const { profitLoss, profitLossRate } = metrics;
        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        // Ensure ratios exist and handle potential NaN/Infinity from division
        const currentRatioVal = stock.currentRatio?.isFinite() ? stock.currentRatio.toFixed(1) : 'N/A';
        const targetRatioVal = typeof stock.targetRatio === 'number' ? stock.targetRatio.toFixed(1) : 'N/A';
        const profitLossRateVal = profitLossRate?.isFinite() ? profitLossRate.toFixed(2) : 'N/A';
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
    }).join('');

    // Filter buyable stocks using Decimal comparison method
    const buyableStocks = sortedResults.filter(s =>
        s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT) // Use greaterThan()
    );
    const guideContent = buyableStocks.length > 0
        ? buyableStocks.map((s, i) => {
            const buyRatioVal = s.buyRatio?.isFinite() ? s.buyRatio.toFixed(1) : 'N/A';
            return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold;">(${buyRatioVal}%)</span>
                </div>`;
             }).join('')
        : `<p style="text-align: center;">${t('template.noItemsToBuy')}</p>`;

    return `
        <div class="summary-grid">
            <div class="summary-item summary-item--current"><h3>${t('template.currentTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.currentTotal, currency)}</div></div>
            <div class="summary-item summary-item--additional"><h3>${t('template.additionalInvestment')}</h3><div class="amount">${formatCurrency(summary?.additionalInvestment, currency)}</div></div>
            <div class="summary-item summary-item--final"><h3>${t('template.finalTotalAsset')}</h3><div class="amount">${formatCurrency(summary?.finalTotal, currency)}</div></div>
        </div>
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
 * @description '매도 리밸런싱' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param {(CalculatedStock & { currentRatio: number, targetRatioNum: number, adjustment: Decimal })[]} results - 계산 결과 배열
 * @param {string} currency - 현재 통화 ('KRW' or 'USD')
 * @returns {string} 생성된 HTML 문자열
 */
export function generateSellModeResultsHTML(results, currency) {
    if (!results) return ''; // Null check for results
    // Sort results safely checking for adjustment property
    const sortedResults = [...results].sort((a, b) => {
        const adjA = a.adjustment ?? new Decimal(0);
        const adjB = b.adjustment ?? new Decimal(0);
        return adjB.comparedTo(adjA);
    });

    const resultsRows = sortedResults.map((s, index) => {
        // Use default values if properties might be missing/NaN
        const currentRatioVal = typeof s.currentRatio === 'number' && isFinite(s.currentRatio) ? s.currentRatio.toFixed(1) : 'N/A';
        const targetRatioVal = typeof s.targetRatioNum === 'number' && isFinite(s.targetRatioNum) ? s.targetRatioNum.toFixed(1) : 'N/A';
        const adjustmentVal = s.adjustment ?? new Decimal(0);

        return `
            <tr class="result-row-highlight" data-delay="${index * 0.05}s">
                <td><strong>${escapeHTML(s.name)}</strong><br><span class="ticker">${escapeHTML(s.ticker)}</span></td>
                <td style="text-align: center;">${currentRatioVal}%</td>
                <td style="text-align: center;"><strong>${targetRatioVal}%</strong></td>
                <td style="text-align: right;">
                    <div class="${adjustmentVal.isPositive() ? 'text-sell' : 'text-buy'}">
                        ${adjustmentVal.isPositive() ? '🔴 매도' : '🔵 매수'}: ${formatCurrency(adjustmentVal.abs(), currency)}
                    </div>
                </td>
            </tr>`;
        }).join('');

    const totalSell = results.reduce((sum, s) => {
        return s.adjustment?.isPositive() ? sum.plus(s.adjustment) : sum;
    }, new Decimal(0));
    const stocksToSell = sortedResults.filter(s => s.adjustment?.isPositive());
    const stocksToBuy = sortedResults.filter(s => s.adjustment?.isNegative()); // isNegative includes zero implicitly, filter < 0 if needed

    const sellGuide = stocksToSell.length > 0
        ? stocksToSell.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment, currency)} 매도</div>`).join('')
        : `<p>${t('template.noItemsToSell')}</p>`;
    const buyGuide = stocksToBuy.length > 0
        ? stocksToBuy.map((s, i) => `<div class="guide-item"><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.adjustment?.abs(), currency)} 매수</div>`).join('')
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
 * @param {{ sector: string, amount: Decimal, percentage: Decimal }[]} sectorData - 섹터 분석 결과 배열
 * @param {string} currency - 현재 통화 ('KRW' or 'USD')
 * @returns {string} 생성된 HTML 문자열
 */
export function generateSectorAnalysisHTML(sectorData, currency) {
    if (!sectorData || sectorData.length === 0) {
        return '';
    }

    const rows = sectorData.map(data => {
         // Ensure percentage is valid before formatting
         const percentageVal = data.percentage?.isFinite() ? data.percentage.toFixed(2) : 'N/A';
         return `
            <tr>
                <td>${escapeHTML(data.sector)}</td>
                <td style="text-align: right;">${formatCurrency(data.amount, currency)}</td>
                <td style="text-align: right;">${percentageVal}%</td>
            </tr>`;
        }).join('');


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

---

## `js/validator.js`

```javascript
// js/validator.js
// @ts-check
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import { getRatioSum } from './utils.js'; // 동기 함수로 복구
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */ // 타입 정의 추가

export const Validator = {
    /**
     * @description '계산하기' 실행 전 입력값들의 유효성을 검사합니다.
     * @param {{ mainMode: string, portfolioData: CalculatedStock[], additionalInvestment: Decimal }} param - 계산 모드, 주식 데이터, 추가 투자금
     * @returns {ValidationErrorDetail[]} 유효성 오류 상세 정보 객체 배열. 오류가 없으면 빈 배열.
     */
    validateForCalculation({ mainMode, portfolioData, additionalInvestment }) {
        /** @type {ValidationErrorDetail[]} */
        const errors = [];
        if (!portfolioData) {
            errors.push({ field: null, stockId: null, message: t('validation.calculationError') });
            return errors;
        }

        for (const stock of portfolioData) {
            const stockName = stock.name?.trim() || '이름 없는 종목';

            if (!stock.name?.trim()) errors.push({ field: 'name', stockId: stock.id, message: t('validation.nameMissing') });
            if (!stock.ticker?.trim()) errors.push({ field: 'ticker', stockId: stock.id, message: t('validation.tickerMissing', { name: stockName }) });

            // Check calculated values exist before using them
            if (stock.calculated && stock.calculated.quantity.greaterThan(0) && (stock.currentPrice ?? 0) <= 0) {
                 errors.push({ field: 'currentPrice', stockId: stock.id, message: t('validation.currentPriceZero', { name: stockName }) });
            }
            // ⬇️ Decimal 생성은 동기
            const fixedBuyAmountDec = new Decimal(stock.fixedBuyAmount || 0);
            if (stock.isFixedBuyEnabled && fixedBuyAmountDec.lte(0)) {
                errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountZero', { name: stockName }) });
            }
            const currentPriceDec = new Decimal(stock.currentPrice || 0);
            if (stock.isFixedBuyEnabled && currentPriceDec.gt(0) && fixedBuyAmountDec.lt(currentPriceDec)) {
                errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountTooSmall', { name: stockName }) });
            }
        }

        if (mainMode === 'add') {
            // additionalInvestment는 이미 Decimal 타입으로 받음
            if (!additionalInvestment || additionalInvestment.isZero() || additionalInvestment.isNegative()) {
                errors.push({ field: 'additionalAmount', stockId: null, message: t('validation.investmentAmountZero') });
            }

            // totalFixedBuy 계산 (동기 loop 사용)
            let totalFixedBuy = new Decimal(0);
            for (const s of portfolioData) {
                 if (s.isFixedBuyEnabled) {
                     const amount = new Decimal(s.fixedBuyAmount || 0);
                     totalFixedBuy = totalFixedBuy.plus(amount);
                 }
            }

            if (additionalInvestment && totalFixedBuy.greaterThan(additionalInvestment)) {
                errors.push({ field: null, stockId: null, message: t('validation.fixedBuyTotalExceeds') });
            }
        } else { // 'sell' mode
            // currentTotal 계산 (동기 loop 사용)
            let currentTotal = new Decimal(0);
            for(const s of portfolioData){
                const amount = s.calculated?.currentAmount ?? new Decimal(0);
                currentTotal = currentTotal.plus(amount);
            }

            if (currentTotal.isZero() || currentTotal.isNegative()) {
                errors.push({ field: null, stockId: null, message: t('validation.currentAmountZero') });
            }
            // ⬇️ getRatioSum은 동기 함수
            const totalRatio = getRatioSum(portfolioData);
            if (Math.abs(totalRatio.toNumber() - 100) > CONFIG.RATIO_TOLERANCE) {
                errors.push({ field: 'targetRatio', stockId: null, message: t('validation.ratioSumNot100', { totalRatio: totalRatio.toNumber().toFixed(1) }) });
            }
        }
        return errors;
    },

    /**
     * @description 숫자 입력값(문자열 포함)을 검증하고 유효한 양수 숫자로 변환합니다. 빈 문자열은 0으로 처리합니다.
     * @param {string | number | boolean | undefined | null} value - 검증할 입력값 (다양한 타입 처리)
     * @returns {{isValid: boolean, value?: number, message?: string}} 유효성 결과 객체
     */
    validateNumericInput(value) {
        if (value === true) return { isValid: false, message: t('validation.invalidNumber') };
        const stringValue = String(value ?? '').trim(); // Handle null/undefined safely
        if (stringValue === '') return { isValid: true, value: 0 };

        const numValue = parseFloat(stringValue);
        // @ts-ignore
        if (isNaN(numValue)) return { isValid: false, message: t('validation.invalidNumber') };
        if (numValue < 0) return { isValid: false, message: t('validation.negativeNumber') };

        return { isValid: true, value: numValue };
    },

    /**
     * @description 거래 내역 데이터(날짜, 수량, 단가)의 유효성을 검사합니다.
     * @param {{ date?: string, quantity?: number, price?: number }} txData - 검증할 거래 데이터 (속성 optional 처리)
     * @returns {{isValid: boolean, message?: string}} 유효성 결과 객체
     */
    validateTransaction(txData) {
        if (!txData || typeof txData !== 'object') {
             return { isValid: false, message: t('validation.invalidTransactionData') };
        }
        // Use NaN to fail isNaN check if undefined
        const date = txData.date ?? '';
        const quantity = txData.quantity ?? NaN;
        const price = txData.price ?? NaN;

        const timestamp = Date.parse(date);
        if (isNaN(timestamp)) {
            return { isValid: false, message: t('validation.invalidDate') };
        }
        if (timestamp > Date.now()) { // 미래 날짜 방지
            return { isValid: false, message: t('validation.futureDate') };
        }
        if (isNaN(quantity) || quantity <= 0) {
            return { isValid: false, message: t('validation.quantityZero') };
        }
        if (isNaN(price) || price <= 0) {
            return { isValid: false, message: t('validation.priceZero') };
        }
        return { isValid: true };
    },

    /**
     * @description 가져온 JSON 데이터의 기본 구조가 유효한지 검사합니다.
     * @param {any} data - 검증할 JSON 데이터
     * @returns {boolean} 구조 유효성 여부
     */
    isDataStructureValid(data) {
        if (!data || typeof data.portfolios !== 'object' || data.portfolios === null || typeof data.activePortfolioId !== 'string') {
            return false;
        }

        const portfolioIds = Object.keys(data.portfolios);
        if (portfolioIds.length === 0) {
             return false;
        }

        // Check if activePortfolioId points to a valid portfolio
        const activePortfolio = data.portfolios[data.activePortfolioId];
        if (!activePortfolio || typeof activePortfolio !== 'object' || activePortfolio === null) {
             return false;
        }

        // Check the structure of the active portfolio
        const portfolioToCheck = activePortfolio;
        if (!Array.isArray(portfolioToCheck.portfolioData) || typeof portfolioToCheck.settings !== 'object' || portfolioToCheck.settings === null) {
            return false;
        }

        // Check structure of the first stock if portfolioData is not empty
        const firstStock = portfolioToCheck.portfolioData[0];
        if (firstStock) { // Only check if firstStock exists
             if (
                typeof firstStock.id !== 'string' ||
                typeof firstStock.name !== 'string' ||
                typeof firstStock.ticker !== 'string' ||
                typeof firstStock.targetRatio !== 'number' ||
                typeof firstStock.currentPrice !== 'number' ||
                !Array.isArray(firstStock.transactions) ||
                typeof firstStock.isFixedBuyEnabled !== 'boolean' ||
                typeof firstStock.fixedBuyAmount !== 'number'
            ) {
                 console.warn("First stock structure mismatch:", firstStock);
                return false;
            }
             // Optionally, check the structure of the first transaction
             const firstTransaction = firstStock.transactions[0];
             if (firstTransaction && (
                 typeof firstTransaction.id !== 'string' ||
                 (firstTransaction.type !== 'buy' && firstTransaction.type !== 'sell') ||
                 typeof firstTransaction.date !== 'string' || // Could add regex check for format
                 typeof firstTransaction.quantity !== 'number' ||
                 typeof firstTransaction.price !== 'number'
             )) {
                  console.warn("First transaction structure mismatch:", firstTransaction);
                  return false;
             }
        }
        // If all checks pass
        return true;
    }
};
```

---

## `js/state.js`

```javascript
// @ts-check
import { CONFIG } from './constants.js';
import { getRatioSum } from './utils.js'; // [수정] 비동기 getRatioSum 임포트
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js';
import { createDecimal } from './decimalLoader.js'; // [수정] createDecimal 헬퍼 임포트

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').PortfolioSettings} PortfolioSettings */
/** @typedef {import('./types.js').PortfolioDataStructure} PortfolioDataStructure */
/** @typedef {import('decimal.js').Decimal} Decimal */

// 상태 관리를 위한 싱글톤 객체
export class PortfolioState {
    /** @type {PortfolioDataStructure} */
    #data;
    /** @type {string | null} */
    #activePortfolioId;

    /** @type {Map<string, CalculatedStock['transactions']>} */
    #transactionCache = new Map();

    constructor() {
        this.#data = { portfolios: {}, activePortfolioId: '' };
        this.#activePortfolioId = null;
        this.loadInitialState();
    }

    // --- 초기 로딩 및 저장 ---

    // ⬇️ [수정] 'expected 2 to be 1' 오류 해결을 위한 로직 수정
    loadInitialState() {
        try {
            const metaJson = localStorage.getItem(CONFIG.META_KEY);
            if (metaJson) {
                const meta = JSON.parse(metaJson);
                this.#activePortfolioId = meta.activePortfolioId;
            }

            // 1. 모든 포트폴리오 ID 로드
            const portfolioIds = this.getAllPortfolioIdsFromLocalStorage();
            
            if (portfolioIds.length > 0) {
                // 2. 각 포트폴리오 데이터 로드 및 역직렬화
                portfolioIds.forEach(id => {
                    const dataJson = localStorage.getItem(CONFIG.DATA_PREFIX + id);
                    if (dataJson) {
                        try {
                            const loadedData = JSON.parse(dataJson);
                            // Validator 대신 _deserializePortfolioData를 사용하여
                            // 데이터를 변환하고 기본 구조를 보장합니다.
                            this.#data.portfolios[id] = this._deserializePortfolioData(loadedData);
                        } catch (parseError) {
                            console.warn(`[State] Invalid JSON for portfolio ID: ${id}. Skipping.`, parseError);
                        }
                    }
                });
            }
            
            // --- [수정된 핵심 로직] ---
            const loadedPortfolioIds = Object.keys(this.#data.portfolios);

            if (loadedPortfolioIds.length > 0) {
                // 3. 포트폴리오가 1개 이상 로드된 경우
                // 4. activePortfolioId가 유효한지(로드된 목록에 있는지) 확인
                if (!this.#activePortfolioId || !this.#data.portfolios[this.#activePortfolioId]) {
                    // 5. 유효하지 않으면, 로드된 포트폴리오 중 첫 번째 것을 활성 ID로 강제 지정
                    this.#activePortfolioId = loadedPortfolioIds[0];
                }
                // (중요) 이 경우 'Default Portfolio'를 생성하지 않습니다.
            } else {
                // 6. 로드된 포트폴리오가 *아무것도* 없을 때만 새로 생성
                // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
                this.createNewPortfolio('기본 포트폴리오');
            }
            // --- [로직 수정 끝] ---

            this.saveMeta(); // (수정됐을 수 있는) 활성 ID 설정 저장
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'loadInitialState');
            // 치명적 로딩 실패 시에도 기본 포트폴리오 생성
            if (Object.keys(this.#data.portfolios).length === 0) {
                // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
                this.createNewPortfolio('기본 포트폴리오');
            }
        }
    }
    // ⬆️ [수정]

    /**
     * @description LocalStorage에서 포트폴리오 ID 목록을 가져옵니다.
     * @returns {string[]}
     */
    getAllPortfolioIdsFromLocalStorage() {
        const ids = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CONFIG.DATA_PREFIX)) {
                ids.push(key.substring(CONFIG.DATA_PREFIX.length));
            }
        }
        return ids;
    }

    saveMeta() {
        if (!this.#activePortfolioId) return;
        try {
            const meta = { activePortfolioId: this.#activePortfolioId };
            localStorage.setItem(CONFIG.META_KEY, JSON.stringify(meta));
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'saveMeta');
        }
    }

    /**
     * @description 현재 활성 포트폴리오 데이터를 LocalStorage에 저장합니다.
     * 주의: 이 함수는 debounce 되어 호출됩니다.
     */
    saveActivePortfolio() {
        if (!this.#activePortfolioId) return;
        try {
            const activePortfolio = this.#data.portfolios[this.#activePortfolioId];
            if (activePortfolio) {
                // 저장 전에 직렬화
                const serializedData = this._serializePortfolioData(activePortfolio);
                localStorage.setItem(CONFIG.DATA_PREFIX + this.#activePortfolioId, JSON.stringify(serializedData));
            }
        } catch (e) {
            ErrorService.handle(/** @type {Error} */(e), 'saveActivePortfolio');
        }
    }

    // --- 데이터 직렬화/역직렬화 ---

    /**
     * @description 저장 전 데이터를 Decimal 객체에서 일반 숫자로 변환합니다.
     * @param {Portfolio} portfolio - 포트폴리오 데이터
     * @returns {any}
     */
    _serializePortfolioData(portfolio) {
        return {
            ...portfolio,
            portfolioData: portfolio.portfolioData.map(stock => ({
                ...stock,
                transactions: stock.transactions.map(tx => ({
                    ...tx,
                    // [수정] Decimal 객체 확인 후 toNumber() 호출
                    quantity: (tx.quantity && typeof tx.quantity === 'object' && 'toNumber' in tx.quantity) ? tx.quantity.toNumber() : Number(tx.quantity || 0),
                    price: (tx.price && typeof tx.price === 'object' && 'toNumber' in tx.price) ? tx.price.toNumber() : Number(tx.price || 0),
                })),
                // targetRatio, currentPrice, fixedBuyAmount는 이미 number 타입으로 관리됨
            })),
            // settings는 이미 number/string 타입으로 구성됨
        };
    }

    /**
     * @description 로드 후 데이터를 일반 숫자에서 Decimal 객체로 변환합니다. (비동기)
     * @param {any} loadedData - 로드된 데이터 (숫자 형태)
     * @returns {Promise<Portfolio>}
     */
    async _deserializePortfolioData(loadedData) {
        // [수정] createDecimal이 비동기이므로, map 내부에서 Promise.all을 사용해야 합니다.
        const portfolioData = await Promise.all(
            (loadedData.portfolioData || []).map(async (stock) => {
                // Ensure required fields are present with default values if necessary
                const name = stock.name || 'Untitled Stock';
                const ticker = stock.ticker || 'TICKER';
                const sector = stock.sector || '미분류'; // [수정] 섹터 기본값 추가
                const currentPrice = Number(stock.currentPrice) || 0;
                const targetRatio = Number(stock.targetRatio) || 0;
                const fixedBuyAmount = Number(stock.fixedBuyAmount) || 0;

                const transactions = await Promise.all(
                    (stock.transactions || []).map(async (tx) => ({
                        id: tx.id,
                        type: tx.type,
                        date: tx.date,
                        // 수량과 가격을 Decimal 객체로 변환
                        quantity: await createDecimal(tx.quantity || 0),
                        price: await createDecimal(tx.price || 0),
                    }))
                );

                return {
                    id: stock.id,
                    name: name,
                    ticker: ticker,
                    sector: sector, // [수정] 섹터 필드 추가
                    currentPrice: currentPrice,
                    targetRatio: targetRatio,
                    isFixedBuyEnabled: stock.isFixedBuyEnabled || false,
                    fixedBuyAmount: fixedBuyAmount,
                    transactions: transactions,
                    _sortedTransactions: this._sortTransactions(transactions) // [수정] 정렬 캐시 추가
                };
            })
        );
        
        return {
            ...loadedData,
            portfolioData: portfolioData,
        };
    }
    
    /**
     * @description 트랜잭션을 정렬하고 캐시합니다. (state 내부 유틸리티)
     * @param {Stock['transactions']} transactions
     * @returns {Stock['transactions']}
     */
    _sortTransactions(transactions) {
         return [...transactions].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.id.localeCompare(b.id); // 날짜 같으면 ID로 안정 정렬
        });
    }


    // --- 포트폴리오 관리 ---

    /**
     * @description 새로운 포트폴리오를 생성하고 활성화합니다.
     * @param {string} name - 포트폴리오 이름
     * @returns {string} 새로 생성된 포트폴리오 ID
     */
    createNewPortfolio(name) {
        const newId = `p-${Date.now()}`;
        /** @type {PortfolioSettings} */
        const defaultSettings = {
            mainMode: 'add',
            currentCurrency: 'krw',
            // [수정] exchangeRate는 number 타입이어야 함
            exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE, 
        };

        /** @type {Portfolio} */
        const newPortfolio = {
            // [수정] id와 name은 Portfolio 타입의 최상위에 위치
            id: newId,
            name: name,
            settings: defaultSettings,
            portfolioData: [], // 기본 템플릿 대신 빈 배열로 시작
        };

        this.#data.portfolios[newId] = newPortfolio;
        this.setActivePortfolioId(newId);
        this.saveActivePortfolio(); // 이 시점에 빈 포트폴리오 저장
        return newId;
    }

    /**
     * @description 포트폴리오를 삭제합니다.
     * @param {string} id - 삭제할 포트폴리오 ID
     * @returns {boolean} 삭제 성공 여부
     */
    deletePortfolio(id) {
        if (Object.keys(this.#data.portfolios).length <= 1) {
            console.warn("Cannot delete the last remaining portfolio.");
            return false;
        }
        if (!this.#data.portfolios[id]) return false;

        delete this.#data.portfolios[id];
        localStorage.removeItem(CONFIG.DATA_PREFIX + id);
        this.#transactionCache.clear(); // 캐시 클리어

        // 활성 포트폴리오 ID 재설정
        const remainingIds = Object.keys(this.#data.portfolios);
        this.setActivePortfolioId(remainingIds[0]); // saveMeta()는 setActivePortfolioId 내부에서 호출됨

        return true;
    }
    
    /**
     * @description 포트폴리오 이름을 변경합니다.
     * @param {string} id - 변경할 포트폴리오 ID
     * @param {string} newName - 새 이름
     * @returns {boolean} 변경 성공 여부
     */
    renamePortfolio(id, newName) {
        const portfolio = this.#data.portfolios[id];
        if (portfolio) {
            portfolio.name = newName;
            this.saveActivePortfolio(); // 현재 활성 포트폴리오면 바로 저장
            return true;
        }
        return false;
    }


    /**
     * @description 활성 포트폴리오 ID를 설정합니다.
     * @param {string} id - 새로운 활성 포트폴리오 ID
     */
    setActivePortfolioId(id) {
        if (this.#data.portfolios[id]) {
            this.#activePortfolioId = id;
            this.saveMeta();
            this.#transactionCache.clear(); // 포트폴리오 변경 시 캐시 클리어
        }
    }

    // --- 주식 데이터 관리 ---

    /**
     * @description 활성 포트폴리오 데이터를 가져옵니다.
     * @returns {Portfolio | undefined}
     */
    getActivePortfolio() {
        if (this.#activePortfolioId) {
            return this.#data.portfolios[this.#activePortfolioId];
        }
        return undefined;
    }

    /**
     * @description 모든 포트폴리오 목록을 (ID: Portfolio) 객체로 가져옵니다.
     * @returns {Record<string, Portfolio>}
     */
    getAllPortfolios() {
        return this.#data.portfolios;
    }

    /**
     * @description 특정 주식의 데이터를 가져옵니다.
     * @param {string} stockId - 주식 ID
     * @returns {Stock | undefined}
     */
    getStockById(stockId) {
        const portfolio = this.getActivePortfolio();
        return portfolio?.portfolioData.find(s => s.id === stockId);
    }

    /**
     * @description 새 주식을 포트폴리오에 추가합니다.
     * @returns {Stock | null}
     */
    addNewStock() {
        const portfolio = this.getActivePortfolio();
        if (portfolio) {
            /** @type {Stock} */
            const newStock = {
                id: `s-${Date.now()}`,
                name: '새 종목', // [수정] 기본 이름 제공
                ticker: '',
                sector: '미분류', // [수정] 기본 섹터 제공
                currentPrice: 0,
                targetRatio: 0,
                isFixedBuyEnabled: false,
                fixedBuyAmount: 0,
                transactions: [],
                _sortedTransactions: [] // [수정] 정렬 캐시 초기화
            };
            portfolio.portfolioData.push(newStock);
            this.saveActivePortfolio();
            return newStock;
        }
        return null;
    }

    /**
     * @description 포트폴리오에서 주식을 제거합니다.
     * @param {string} stockId - 제거할 주식 ID
     * @returns {boolean}
     */
    deleteStock(stockId) {
        const portfolio = this.getActivePortfolio();
        if (portfolio) {
             // [수정] 마지막 주식은 삭제하지 못하도록 방어 로직 추가
            if (portfolio.portfolioData.length <= 1) {
                console.warn("Cannot delete the last stock.");
                return false;
            }
            portfolio.portfolioData = portfolio.portfolioData.filter(s => s.id !== stockId);
            this.#transactionCache.delete(stockId); // [수정] 해당 주식 캐시만 삭제
            this.saveActivePortfolio();
            return true;
        }
        return false;
    }

    /**
     * @description 주식 속성 (이름, 티커, 목표 비율 등)을 업데이트합니다.
     * @param {string} stockId - 주식 ID
     * @param {string} field - 업데이트할 속성 이름
     * @param {string | number | boolean} value - 새로운 값
     */
    updateStockProperty(stockId, field, value) {
        const stock = this.getStockById(stockId);
        if (stock) {
            // @ts-ignore
            stock[field] = value;
            this.saveActivePortfolio();
        }
    }

    // --- 거래 내역 관리 ---

    /**
     * @description 특정 주식의 거래 내역을 가져옵니다 (캐싱 적용).
     * @param {string} stockId - 주식 ID
     * @returns {Stock['transactions']} 정렬된 거래 내역
     */
    getTransactions(stockId) {
        // [수정] _sortedTransactions 캐시를 사용
        const stock = this.getStockById(stockId);
        return stock?._sortedTransactions || [];
    }

    /**
     * @description 새 거래를 추가합니다.
     * @param {string} stockId - 주식 ID
     * @param {{type: 'buy'|'sell', date: string, quantity: number | Decimal, price: number | Decimal}} txData - 거래 데이터
     * @returns {Promise<boolean>}
     */
    async addTransaction(stockId, txData) {
        const stock = this.getStockById(stockId);
        if (stock) {
            /** @type {Stock['transactions'][number]} */
            const newTx = {
                id: `tx-${Date.now()}`,
                type: txData.type,
                date: txData.date,
                // [수정] 입력값이 Decimal이 아닐 수 있으므로 createDecimal 사용
                quantity: await createDecimal(txData.quantity),
                price: await createDecimal(txData.price),
            };
            stock.transactions.push(newTx);
            // [수정] 정렬 캐시 업데이트
            stock._sortedTransactions = this._sortTransactions(stock.transactions);
            this.saveActivePortfolio();
            return true;
        }
        return false;
    }

    /**
     * @description 거래 내역을 삭제합니다.
     * @param {string} stockId - 주식 ID
     * @param {string} transactionId - 거래 ID
     * @returns {boolean}
     */
    deleteTransaction(stockId, transactionId) {
        const stock = this.getStockById(stockId);
        if (stock) {
            stock.transactions = stock.transactions.filter(tx => tx.id !== transactionId);
            // [수정] 정렬 캐시 업데이트
            stock._sortedTransactions = this._sortTransactions(stock.transactions);
            this.saveActivePortfolio();
            return true;
        }
        return false;
    }

    // --- 유틸리티 ---

    /**
     * @description 현재 활성 포트폴리오의 목표 비율 합계를 계산합니다.
     * @returns {Promise<Decimal>} 목표 비율 합계 Promise
     */
    async getRatioSum() {
        const portfolio = this.getActivePortfolio();
        if (!portfolio) return await createDecimal(0);

        // [수정] 비동기 getRatioSum 함수(구 utils.js)를 await로 호출
        return await getRatioSum(portfolio.portfolioData);
    }

    /**
     * @description 목표 비율의 합계를 100%로 정규화합니다.
     * @returns {Promise<boolean>} 정규화 성공 여부 Promise
     */
    async normalizeRatios() {
        const portfolio = this.getActivePortfolio();
        if (!portfolio || portfolio.portfolioData.length === 0) return false;

        const portfolioData = portfolio.portfolioData;
        const currentSum = await this.getRatioSum(); // [수정] await

        if (currentSum.isZero()) return false;

        const multiplier = (await createDecimal(100)).div(currentSum); // [수정] await

        for (const stock of portfolioData) {
            // targetRatio는 number 타입이므로, Decimal로 변환 후 계산
            const ratioDec = await createDecimal(stock.targetRatio); // [수정] await
            stock.targetRatio = ratioDec.times(multiplier).toNumber();
        }

        this.saveActivePortfolio();
        return true;
    }

    /**
     * @description 포트폴리오의 설정(통화, 환율, 모드 등)을 업데이트합니다.
     * @param {string} field - 업데이트할 설정 속성
     * @param {string | number} value - 새로운 값
     */
    updatePortfolioSettings(field, value) {
        const portfolio = this.getActivePortfolio();
        if (portfolio && portfolio.settings) { // [수정] settings 확인
            // @ts-ignore
            portfolio.settings[field] = value;
            this.saveActivePortfolio();
        }
    }

    /**
     * @description 외부에서 JSON 데이터를 로드합니다. (비동기)
     * @param {PortfolioDataStructure} loadedData - 로드된 전체 포트폴리오 데이터
     * @returns {Promise<void>}
     */
    async importData(loadedData) {
        if (!loadedData || typeof loadedData.portfolios !== 'object' || !loadedData.activePortfolioId) {
            throw new Error('Invalid data structure for import.');
        }

        const newPortfolios = {};
        // [수정] for...in 루프를 Promise.all로 변환
        await Promise.all(Object.keys(loadedData.portfolios).map(async (id) => {
             // Deserialize each portfolio
            newPortfolios[id] = await this._deserializePortfolioData(loadedData.portfolios[id]);
            // Save immediately to local storage to ensure persistence
            const serializedData = this._serializePortfolioData(newPortfolios[id]);
            localStorage.setItem(CONFIG.DATA_PREFIX + id, JSON.stringify(serializedData));
        }));


        this.#data.portfolios = newPortfolios;
        this.setActivePortfolioId(loadedData.activePortfolioId);
        // this.saveMeta(); // setActivePortfolioId에 포함됨
        this.#transactionCache.clear();
    }

    /**
     * @description 모든 포트폴리오 데이터를 JSON으로 내보냅니다.
     * @returns {PortfolioDataStructure}
     */
    exportData() {
        const exportedPortfolios = {};
        for (const id in this.#data.portfolios) {
            if (Object.prototype.hasOwnProperty.call(this.#data.portfolios, id)) {
                // 직렬화하여 일반 숫자 형태로 내보내기
                exportedPortfolios[id] = this._serializePortfolioData(this.#data.portfolios[id]);
            }
        }
        return {
            portfolios: exportedPortfolios,
            activePortfolioId: this.#activePortfolioId || ''
        };
    }

    /**
     * @description 모든 데이터를 초기화하고 기본 포트폴리오를 생성합니다.
     */
    resetData() {
        // 모든 포트폴리오 데이터 삭제
        const portfolioIds = this.getAllPortfolioIdsFromLocalStorage();
        portfolioIds.forEach(id => localStorage.removeItem(CONFIG.DATA_PREFIX + id));
        localStorage.removeItem(CONFIG.META_KEY);

        this.#data = { portfolios: {}, activePortfolioId: '' };
        this.#activePortfolioId = null;
        this.#transactionCache.clear();
        // [수정] 테스트 케이스와 일치하도록 '기본 포트폴리오'로 변경
        this.createNewPortfolio('기본 포트폴리오');
    }
}
```

---

## `js/state.test.js`

```javascript
// js/state.test.js (수정본)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js'; // CONFIG 임포트 추가

// localStorage 모의(mock) 처리
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
    key: (index) => Object.keys(store)[index] || null, // key() 메소드 추가
    get length() { return Object.keys(store).length; } // length 속성 추가
  };
})();

// window.localStorage 모의 객체 할당
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('PortfolioState', () => {
  let state;

  beforeEach(() => {
    localStorage.clear();
    // crypto 객체가 없으면 모의 처리 (테스트 환경에 따라 필요할 수 있음)
    if (typeof crypto === 'undefined') {
      global.crypto = { randomUUID: () => `mock-uuid-${Math.random()}` };
    } else {
        // 이미 존재하면 randomUUID만 모의 처리
        vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `mock-uuid-${Math.random()}`);
    }
    state = new PortfolioState(); // 각 테스트 전에 새 인스턴스 생성
  });

  afterEach(() => {
    vi.restoreAllMocks(); // 모든 모의 함수 복원
  });

  it('초기화 시 기본 포트폴리오("기본 포트폴리오")를 생성해야 합니다.', () => {
    // beforeEach에서 state가 생성되므로 추가 생성 필요 없음
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1); // 수정: getAllPortfolios 사용
    expect(state.getActivePortfolio()?.name).toBe('기본 포트폴리오'); // 수정: name 확인
  });

  // ⬇️ [추가] localStorage 로드 테스트 케이스
  it('localStorage에 저장된 데이터가 있으면 올바르게 로드해야 합니다.', () => {
    // 1. 테스트 데이터 준비
    const testId = 'p-test123';
    const testPortfolio = {
      id: testId,
      name: "Saved Portfolio",
      settings: { mainMode: 'add', currentCurrency: 'krw', exchangeRate: 1300 },
      portfolioData: [{ id: 's-test', name: 'Test Stock', ticker: 'TEST', sector: 'Tech', currentPrice: 100, targetRatio: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [] }]
    };
    const metaData = { activePortfolioId: testId };

    // 2. localStorage에 데이터 저장 (직렬화된 형태여야 함)
    // _serializePortfolioData를 직접 호출하기 어려우므로 수동으로 유사하게 만듭니다.
    const serializedPortfolio = {
      ...testPortfolio,
      portfolioData: testPortfolio.portfolioData.map(s => ({
        ...s,
        transactions: [] // 여기서는 빈 배열로 가정
      }))
    };
    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(serializedPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    // 3. 새 PortfolioState 인스턴스 생성 (로드 로직 실행)
    const loadedState = new PortfolioState();

    // 4. 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1); // 저장된 1개만 로드되어야 함
    expect(loadedState.getActivePortfolio()?.id).toBe(testId);
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
    expect(loadedState.getActivePortfolio()?.portfolioData.length).toBe(1);
    expect(loadedState.getActivePortfolio()?.portfolioData[0].name).toBe("Test Stock");
  });

  // ⬇️ [추가] META_KEY의 ID가 유효하지 않을 때 로드된 첫 번째 포트폴리오를 활성화하는지 테스트
  it('META_KEY의 activePortfolioId가 유효하지 않으면 로드된 첫 포트폴리오를 활성화해야 합니다.', () => {
     // 1. 테스트 데이터 준비 (위와 동일)
    const testId = 'p-test123';
    const testPortfolio = { id: testId, name: "Saved Portfolio", settings: {}, portfolioData: [] };
    const metaData = { activePortfolioId: 'invalid-id-123' }; // 잘못된 ID

    localStorage.setItem(CONFIG.DATA_PREFIX + testId, JSON.stringify(testPortfolio));
    localStorage.setItem(CONFIG.META_KEY, JSON.stringify(metaData));

    // 2. 새 인스턴스 생성
    const loadedState = new PortfolioState();

    // 3. 검증
    expect(Object.keys(loadedState.getAllPortfolios()).length).toBe(1); // 여전히 1개여야 함 (Default 생성 안 됨)
    expect(loadedState.getActivePortfolio()?.id).toBe(testId); // 로드된 포트폴리오 ID로 활성화되어야 함
    expect(loadedState.getActivePortfolio()?.name).toBe("Saved Portfolio");
  });
  // ⬆️ [추가]

  it('새로운 주식을 액티브 포트폴리오에 추가해야 합니다.', () => {
    const initialCount = state.getActivePortfolio()?.portfolioData.length ?? 0; // 수정: 초기 카운트 안전하게
    const newStock = state.addNewStock(); // 수정: 반환값 사용
    expect(newStock).not.toBeNull(); // 새 주식이 생성되었는지 확인
    const newCount = state.getActivePortfolio()?.portfolioData.length ?? 0; // 수정: 새 카운트 안전하게
    expect(newCount).toBe(initialCount + 1);
    // const addedStock = state.getActivePortfolio()?.portfolioData[newCount - 1]; // 수정: 안전하게 접근
    // expect(addedStock?.name).toBe('새 종목'); // addNewStock에서 기본 이름 설정됨
  });

  it('주식을 삭제해야 합니다.', () => {
    // 삭제할 주식을 추가 (기본 1개만 있으면 삭제 안 됨)
    state.addNewStock();
    const portfolio = state.getActivePortfolio()?.portfolioData;
    if (!portfolio || portfolio.length < 2) throw new Error("테스트 설정 오류: 주식이 2개 이상 필요");

    const initialCount = portfolio.length;
    const stockToDelete = portfolio[0]; // 첫 번째 주식 삭제 시도
    const result = state.deleteStock(stockToDelete.id);
    expect(result).toBe(true);
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(initialCount - 1);
  });

  it('마지막 남은 주식은 삭제할 수 없습니다.', () => {
    const portfolio = state.getActivePortfolio()?.portfolioData;
    if (!portfolio || portfolio.length !== 1) throw new Error("테스트 설정 오류: 주식이 1개여야 함");

    const lastStockId = portfolio[0].id;
    const result = state.deleteStock(lastStockId);

    expect(result).toBe(false); // 마지막 주식 삭제 시도는 false여야 함
    expect(state.getActivePortfolio()?.portfolioData.length).toBe(1); // 배열 길이는 1로 유지되어야 함
  });

  it('주식 정보를 업데이트해야 합니다.', () => {
    const stock = state.getActivePortfolio()?.portfolioData[0];
    if (!stock) throw new Error("테스트 설정 오류: 주식이 존재해야 함");

    const newName = "Updated Stock Name";
    // 수정: updateStock -> updateStockProperty
    state.updateStockProperty(stock.id, 'name', newName);
    const updatedStock = state.getActivePortfolio()?.portfolioData.find(s => s.id === stock.id);
    expect(updatedStock?.name).toBe(newName);
  });

  it('새로운 포트폴리오를 추가하고 활성화해야 합니다.', () => {
    const initialPortfolioCount = Object.keys(state.getAllPortfolios()).length; // 수정: getAllPortfolios 사용
    const newPortfolioName = "My New Portfolio";
    // 수정: addPortfolio -> createNewPortfolio
    const newId = state.createNewPortfolio(newPortfolioName);

    expect(Object.keys(state.getAllPortfolios()).length).toBe(initialPortfolioCount + 1); // 수정: getAllPortfolios 사용
    expect(state.getActivePortfolio()?.id).toBe(newId); // 수정: activePortfolioId 대신 getActivePortfolio().id 사용
    expect(state.getActivePortfolio()?.name).toBe(newPortfolioName);
  });
});
```

---

## `js/i18n.js`

```javascript
// js/i18n.js (새 파일)
// @ts-check

// 1. 모든 문자열을 계층 구조로 정의합니다.
const messages = {
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
    transactionAdded: "거래 내역이 추가되었습니다.",
    transactionDeleted: "거래 내역이 삭제되었습니다.",
    chartError: "차트 시각화에 실패했습니다." // 5-1에서 추가했던 문자열
  },
  modal: {
    confirmResetTitle: "데이터 초기화",
    confirmResetMsg: "현재 포트폴리오를 초기 템플릿으로 되돌리시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    confirmDeletePortfolioTitle: "포트폴리오 삭제",
    confirmDeletePortfolioMsg: "정말로 '{name}' 포트폴리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    confirmDeleteTransactionTitle: "거래 내역 삭제",
    confirmDeleteTransactionMsg: "이 거래 내역을 정말로 삭제하시겠습니까?",
    confirmRatioSumWarnTitle: "목표 비율 확인",
    confirmRatioSumWarnMsg: "목표비율 합이 {totalRatio}%입니다. 100%가 아니어도 계산을 진행하시겠습니까?",
    promptNewPortfolioNameTitle: "새 포트폴리오 생성",
    promptNewPortfolioNameMsg: "새 포트폴리오의 이름을 입력하세요:",
    promptRenamePortfolioTitle: "이름 변경",
    promptRenamePortfolioMsg: "새로운 포트폴리오 이름을 입력하세요:"
  },
  validation: {
    calculationError: "계산 중 오류가 발생했습니다. 입력값을 확인해주세요.",
    validationErrorPrefix: "입력값을 확인해주세요: ",
    saveErrorGeneral: "저장 중 오류가 발생했습니다.",
    saveErrorQuota: "저장 공간이 부족합니다. 불필요한 포트폴리오를 삭제해 주세요.",
    calcErrorDecimal: "입력값이 너무 크거나 잘못된 형식입니다.",
    calcErrorType: "데이터 형식 오류가 발생했습니다.",
    invalidFileStructure: "파일의 구조가 올바르지 않거나 손상되었습니다.",
    investmentAmountZero: "- 추가 투자 금액을 0보다 크게 입력해주세요.",
    currentAmountZero: "- 현재 금액이 0보다 커야 리밸런싱을 계산할 수 있습니다.",
    ratioSumNot100: "- 목표 비율의 합이 100%가 되어야 합니다. (현재: {totalRatio}%)",
    invalidTransactionData: "- 거래 날짜, 수량, 단가를 올바르게 입력해주세요.",
    fixedBuyAmountTooSmall: "- '{name}'의 고정 매수 금액이 현재가보다 작아 1주도 매수할 수 없습니다.",
    // validator.js에서 가져온 메시지
    invalidNumber: "유효한 숫자가 아닙니다.",
    negativeNumber: "음수는 입력할 수 없습니다.",
    invalidDate: "유효한 날짜를 입력해주세요.",
    futureDate: "미래 날짜는 입력할 수 없습니다.",
    quantityZero: "수량은 0보다 커야 합니다.",
    priceZero: "단가는 0보다 커야 합니다.",
    // controller.js validation
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
    currentPriceInput: "{name} 현재가 입력"
  }
};

/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 * @param {string} key - 점으로 구분된 메시지 키 (예: 'toast.dataReset')
 * @param {Record<string, string | number>} [replacements] - {name}, {totalRatio} 등을 대체할 값
 * @returns {string}
 */
export function t(key, replacements = {}) {
    // 'toast.dataReset' -> ['toast', 'dataReset']
    const keys = key.split('.');
    
    // @ts-ignore
    let message = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, messages);

    if (typeof message !== 'string') {
        console.warn(`[i18n] Missing key: ${key}`);
        return key; // 키가 없으면 키 자체를 반환
    }

    // {name}, {totalRatio}와 같은 플레이스홀더를 실제 값으로 대체
    return message.replace(/{(\w+)}/g, (match, placeholder) => {
        return replacements[placeholder] !== undefined
            ? String(replacements[placeholder])
            : match;
    });
}
```

---

## `js/eventBinder.js`

```javascript
// @ts-check
import { debounce } from './utils.js';
/** @typedef {import('./controller.js').PortfolioController} PortfolioController */

/**
 * @description 애플리케이션의 모든 DOM 이벤트 리스너를 컨트롤러의 핸들러 함수에 바인딩합니다.
 * @param {PortfolioController} controller - PortfolioController 인스턴스
 * @param {Record<string, HTMLElement | NodeListOf<HTMLElement>>} dom - 캐시된 DOM 요소 객체
 * @returns {void}
 */
export function bindEventListeners(controller, dom) {
    // 포트폴리오 관리 버튼
    // @ts-ignore
    dom.newPortfolioBtn?.addEventListener('click', () => controller.handleNewPortfolio());
    // @ts-ignore
    dom.renamePortfolioBtn?.addEventListener('click', () => controller.handleRenamePortfolio());
    // @ts-ignore
    dom.deletePortfolioBtn?.addEventListener('click', () => controller.handleDeletePortfolio());
    // @ts-ignore
    dom.portfolioSelector?.addEventListener('change', () => controller.handleSwitchPortfolio());

    // 포트폴리오 설정 버튼
    // @ts-ignore
    dom.addNewStockBtn?.addEventListener('click', () => controller.handleAddNewStock());
    // @ts-ignore
    dom.resetDataBtn?.addEventListener('click', () => controller.handleResetData());
    // @ts-ignore
    dom.normalizeRatiosBtn?.addEventListener('click', () => controller.handleNormalizeRatios());
    // @ts-ignore
    dom.fetchAllPricesBtn?.addEventListener('click', () => controller.handleFetchAllPrices()); // API 버튼 추가

    // 데이터 관리 드롭다운
    const dataManagementBtn = /** @type {HTMLElement} */ (document.getElementById('dataManagementBtn'));
    const dataDropdownContent = /** @type {HTMLElement} */ (document.getElementById('dataDropdownContent'));
    const exportDataBtn = /** @type {HTMLElement} */ (document.getElementById('exportDataBtn'));
    const importDataBtn = /** @type {HTMLElement} */ (document.getElementById('importDataBtn'));
    const importFileInput = /** @type {HTMLInputElement} */ (document.getElementById('importFileInput'));

    dataManagementBtn?.addEventListener('click', () => {
        dataDropdownContent?.classList.toggle('show');
    });

    exportDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleExportData();
        dataDropdownContent?.classList.remove('show');
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        controller.handleImportData(); // 파일 선택 창 열기
        dataDropdownContent?.classList.remove('show');
    });

    // 드롭다운 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent && !dataManagementBtn.contains(target)) {
            dataDropdownContent.classList.remove('show');
        }
    });

    // 파일 선택 완료 시
    importFileInput?.addEventListener('change', (e) => controller.handleFileSelected(e));

    // 포트폴리오 테이블 입력 처리 (Debounce 적용)
    const debouncedUpdate = debounce(() => controller.updateUIState(), 300);
    // @ts-ignore
    dom.portfolioBody?.addEventListener('change', (e) => controller.handlePortfolioBodyChange(e, debouncedUpdate));
    // @ts-ignore
    dom.portfolioBody?.addEventListener('click', (e) => controller.handlePortfolioBodyClick(e));
    
    // 포트폴리오 테이블 내 키보드 네비게이션 및 단축키
    const portfolioBody = dom.portfolioBody as HTMLElement | null;
    portfolioBody?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return; // 입력 요소에서만 동작

        const row = target.closest('tr[data-id]');
        if (!row?.dataset.id) return;
        const stockId = row.dataset.id;
        const field = target.dataset.field;

        switch (e.key) {
            case 'Enter':
                 // 티커 입력 후 Enter 시 거래 관리 모달 열기
                 if (field === 'ticker') {
                    e.preventDefault();
                    const stock = controller.state.getActivePortfolio()?.portfolioData.find(s => s.id === stockId);
                    const currency = controller.state.getActivePortfolio()?.settings.currentCurrency;
                    if (stock && currency) controller.view.openTransactionModal(stock, currency, controller.state.getTransactions(stockId));
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                // 위/아래 방향키로 행 이동
                e.preventDefault();
                const parentTbody = row.parentNode;
                const siblingRow = (e.key === 'ArrowUp') ? row.previousElementSibling?.previousElementSibling : row.nextElementSibling?.nextElementSibling; // 입력행 기준으로 2칸 이동

                if (siblingRow && siblingRow.matches('.stock-inputs')) {
                    const targetInput = /** @type {HTMLElement | null} */ (siblingRow.querySelector(`[data-field="${field}"]`));
                    targetInput?.focus();
                }
                break;
            case 'Delete':
                // Ctrl + Delete 로 주식 삭제 (종목명 필드에서)
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     controller.handleDeleteStock(stockId);
                }
                break;
            case 'Escape':
                 // 입력 취소 (포커스 아웃)
                 e.preventDefault();
                 target.blur();
                 break;
        }
    });

    // 숫자 입력 필드 포커스 시 전체 선택
    // @ts-ignore
    dom.portfolioBody?.addEventListener('focusin', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    // @ts-ignore
    dom.calculateBtn?.addEventListener('click', () => controller.handleCalculate());
    // 계산 버튼 - Space/Enter 키 지원 (접근성 향상)
    // @ts-ignore
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            controller.handleCalculate();
        }
    });

    // 계산/통화 모드 라디오 버튼
    // @ts-ignore
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => controller.handleMainModeChange(/** @type {HTMLInputElement} */ (e.target).value as 'add' | 'sell')));
    // @ts-ignore
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => controller.handleCurrencyModeChange(/** @type {HTMLInputElement} */ (e.target).value as 'KRW' | 'USD')));

    // 추가 투자금액 입력 및 환율 변환 (Debounce 적용, immediate 옵션 선택적 사용)
    const debouncedConversion = debounce((source) => controller.handleCurrencyConversion(source), 300 /*, true*/ );
    // @ts-ignore
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    // @ts-ignore
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    // @ts-ignore
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        controller.view.toggleInputValidation(target, isValid);
        if (isValid) debouncedConversion('krw'); // 환율 변경 시 원화 기준으로 USD 금액 재계산
    });

    // 추가 투자금액 관련 필드에서 Enter 키 누르면 계산 실행
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !e.isComposing) { // isComposing: 한글 입력 중 Enter 방지
            e.preventDefault();
            controller.handleCalculate();
        }
    };
    // @ts-ignore
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    // @ts-ignore
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    // @ts-ignore
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // --- 모달 관련 이벤트 ---
    // 거래 내역 모달 닫기 버튼
    // @ts-ignore
    dom.closeModalBtn?.addEventListener('click', () => controller.view.closeTransactionModal());
    // 모달 외부(오버레이) 클릭 시 닫기
    // @ts-ignore
    dom.transactionModal?.addEventListener('click', (e) => {
        if (e.target === dom.transactionModal) controller.view.closeTransactionModal();
    });
    // 새 거래 추가 폼 제출
    // @ts-ignore
    dom.newTransactionForm?.addEventListener('submit', (e) => controller.handleAddNewTransaction(e));
    // 거래 내역 목록 내 삭제 버튼 클릭
    // @ts-ignore
    dom.transactionListBody?.addEventListener('click', (e) => controller.handleTransactionListClick(e));

    // --- 기타 ---
    // 다크 모드 토글 버튼
    // @ts-ignore
    dom.darkModeToggle?.addEventListener('click', () => controller.handleToggleDarkMode());
    // 페이지 닫기 전 자동 저장 (동기식 저장 시도)
    window.addEventListener('beforeunload', () => controller.handleSaveDataOnExit());

    /**
     * [추가] 키보드 네비게이션 시 포커스 표시를 위한 클래스 토글
     */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav'); // 마우스 사용 시 클래스 제거
    });
}
```

---

## `js/errorService.js`

```javascript
// @ts-check
import { PortfolioView } from './view.js';
import { t } from './i18n.js';

/**
 * @description 유효성 검사 오류를 나타내는 커스텀 에러 클래스
 */
export class ValidationError extends Error {
    /**
     * @param {string} message - 오류 메시지
     */
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const ErrorService = {
    /**
     * @description 중앙 집중식 에러 핸들러. 콘솔에 에러를 기록하고 사용자에게 토스트 메시지를 표시합니다.
     * @param {Error} error - 발생한 에러 객체
     * @param {string} [context='General'] - 에러가 발생한 컨텍스트(함수명 등)
     * @returns {void}
     */
    handle(error, context = 'General') {
        console.error(`Error in ${context}:`, error);

        // 기본 오류 메시지
        let userMessage = t('validation.calculationError');

        // 오류 타입에 따라 사용자 메시지 구체화
        if (error instanceof ValidationError) {
            userMessage = `${t('validation.validationErrorPrefix')}\n${error.message}`;
        } else if (error.name === 'DecimalError') { // Decimal.js 관련 오류
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes("structure")) { // 파일 구조 관련 오류 (import 시)
            userMessage = t('validation.invalidFileStructure');
        }
        // TODO: 네트워크 오류 등 다른 종류의 에러에 대한 처리 추가 가능

        // 사용자에게 토스트 메시지 표시
        PortfolioView.showToast(userMessage, 'error');
    }
};
```

---

## `js/view.js`

```javascript
// js/view.js
// @ts-check
import { CONFIG } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js'; // Decimal 임포트 유지

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

export const PortfolioView = {
    /** @type {Record<string, HTMLElement | NodeListOf<HTMLElement> | null>} */
    dom: {}, // dom 객체를 빈 객체 또는 Record로 초기화
    /** @type {import('chart.js').Chart | null} */
    chartInstance: null,
    /** @type {IntersectionObserver | null} */
    currentObserver: null,
    /** @type {((value: any) => void) | null} */
    activeModalResolver: null,
    /** @type {HTMLElement | null} */
    lastFocusedElement: null,

    /**
     * @description 필요한 DOM 요소들을 찾아 `this.dom` 객체에 캐시합니다.
     * @returns {void}
     */
    cacheDomElements() {
        const D = document;
        this.dom = {
            portfolioBody: D.getElementById('portfolioBody'),
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'), // 캔버스 ID 유지
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            mainModeSelector: D.querySelectorAll('input[name="mainMode"]'),
            currencyModeSelector: D.querySelectorAll('input[name="currencyMode"]'),
            exchangeRateGroup: D.getElementById('exchangeRateGroup'),
            usdInputGroup: D.getElementById('usdInputGroup'),
            addInvestmentCard: D.getElementById('addInvestmentCard'),
            calculateBtn: D.getElementById('calculateBtn'),
            darkModeToggle: D.getElementById('darkModeToggle'),
            addNewStockBtn: D.getElementById('addNewStockBtn'),
            fetchAllPricesBtn: D.getElementById('fetchAllPricesBtn'),
            resetDataBtn: D.getElementById('resetDataBtn'),
            normalizeRatiosBtn: D.getElementById('normalizeRatiosBtn'),

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
            portfolioTableHead: D.getElementById('portfolioTableHead'),
            ratioValidator: D.getElementById('ratioValidator'),
            ratioSum: D.getElementById('ratioSum'),

            customModal: D.getElementById('customModal'),
            customModalTitle: D.getElementById('customModalTitle'),
            customModalMessage: D.getElementById('customModalMessage'),
            customModalInput: D.getElementById('customModalInput'),
            customModalConfirm: D.getElementById('customModalConfirm'),
            customModalCancel: D.getElementById('customModalCancel'),
        };

        // --- TypeScript 문법 제거 및 JSDoc 사용 ---
        /** @type {HTMLButtonElement | null} */
        const cancelBtn = this.dom.customModalCancel;
        /** @type {HTMLButtonElement | null} */
        const confirmBtn = this.dom.customModalConfirm;
        /** @type {HTMLElement | null} */
        const customModalEl = this.dom.customModal;
        /** @type {HTMLInputElement | null} */
        const customModalInputEl = this.dom.customModalInput;
        /** @type {HTMLElement | null} */
        const customModalTitleEl = this.dom.customModalTitle;
        /** @type {HTMLElement | null} */
        const customModalMessageEl = this.dom.customModalMessage;
        // --- TypeScript 문법 제거 완료 ---

        // 이벤트 리스너 추가 (null 체크 포함)
        cancelBtn?.addEventListener('click', () => this._handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this._handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._handleCustomModal(false);
        });
    },

    /**
     * @description 확인/취소 형태의 모달을 표시합니다.
     * @param {string} title - 모달 제목
     * @param {string} message - 모달 메시지
     * @returns {Promise<boolean>} 사용자가 '확인'을 누르면 true, '취소'나 닫기를 누르면 false 반환
     */
    async showConfirm(title, message) {
        return this._showModal({ title, message, type: 'confirm' });
    },

    /**
     * @description 텍스트 입력을 받는 형태의 모달을 표시합니다.
     * @param {string} title - 모달 제목
     * @param {string} message - 모달 메시지
     * @param {string} [defaultValue=''] - 입력 필드의 기본값
     * @returns {Promise<string | null>} 사용자가 '확인'을 누르면 입력된 문자열, '취소'나 닫기를 누르면 null 반환
     */
    async showPrompt(title, message, defaultValue = '') {
        return this._showModal({ title, message, defaultValue, type: 'prompt' });
    },

    /**
     * @description 내부 모달 제어 함수. Promise를 사용하여 사용자 응답을 비동기적으로 처리합니다.
     * @param {{ title: string; message: string; defaultValue?: string; type: 'confirm' | 'prompt'; }} options - 모달 옵션
     * @returns {Promise<boolean | string | null>} 사용자 응답 (confirm: boolean, prompt: string | null)
     */
    _showModal(options) {
        return new Promise((resolve) => {
            this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
            this.activeModalResolver = resolve;

            const { title, message, defaultValue, type } = options;

            // --- TypeScript 문법 제거 및 JSDoc 사용 ---
            /** @type {HTMLElement | null} */
            const titleEl = this.dom.customModalTitle;
            /** @type {HTMLElement | null} */
            const messageEl = this.dom.customModalMessage;
            /** @type {HTMLInputElement | null} */
            const inputEl = this.dom.customModalInput;
            /** @type {HTMLElement | null} */
            const modalEl = this.dom.customModal;
            /** @type {HTMLButtonElement | null} */
            const confirmBtnEl = this.dom.customModalConfirm;
             // --- TypeScript 문법 제거 완료 ---

            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;

            if (type === 'prompt' && inputEl) {
                inputEl.value = defaultValue ?? '';
                inputEl.classList.remove('hidden');
            } else if (inputEl) {
                inputEl.classList.add('hidden');
            }

            if (modalEl) {
                modalEl.classList.remove('hidden');
                this._trapFocus(modalEl); // Non-null assertion removed
            }

            // 프롬프트면 input에, 아니면 확인 버튼에 포커스
            if (type === 'prompt' && inputEl) {
                inputEl.focus();
            } else if (confirmBtnEl){
                confirmBtnEl.focus();
            }
        });
    },

    /**
     * @description 커스텀 모달의 확인/취소 버튼 클릭 및 Esc 키 입력을 처리합니다.
     * @param {boolean} confirmed - 확인 버튼 클릭 여부
     * @returns {void}
     */
    _handleCustomModal(confirmed) {
        if (!this.activeModalResolver) return;

        /** @type {HTMLInputElement | null} */
        const inputEl = this.dom.customModalInput;
        /** @type {HTMLElement | null} */
        const modalEl = this.dom.customModal;

        const isPrompt = inputEl && !inputEl.classList.contains('hidden');
        const value = isPrompt ? (confirmed ? inputEl?.value : null) : confirmed;

        this.activeModalResolver(value);

        modalEl?.classList.add('hidden');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();

        this.activeModalResolver = null;
        this.lastFocusedElement = null;
    },

    /**
     * @description 모달 내에서 Tab 키 이동이 밖으로 벗어나지 않도록 포커스를 가둡니다(Trap focus).
     * @param {HTMLElement} element - 포커스를 가둘 대상 요소 (모달 컨텐츠)
     * @returns {void}
     */
    _trapFocus(element) {
        // null 체크 추가
        if (!element) return;
        const focusableEls = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = /** @type {HTMLElement} */ (focusableEls[0]);
        const lastFocusableEl = /** @type {HTMLElement} */ (focusableEls[focusableEls.length - 1]);

        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        });
    },

    /**
     * @description 포트폴리오 목록 드롭다운(<select>) UI를 렌더링합니다.
     * @param {Record<string, import('./types.js').Portfolio>} portfolios - 모든 포트폴리오 데이터 객체
     * @param {string | null} activeId - 현재 활성화된 포트폴리오 ID
     * @returns {void}
     */
    renderPortfolioSelector(portfolios, activeId) {
        /** @type {HTMLSelectElement | null} */
        const selector = this.dom.portfolioSelector;
        if (!selector) return;
        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name; // Portfolio 객체에서 name 사용
            option.selected = (id === activeId);
            selector.appendChild(option);
        });
    },

    /**
     * @description 표준 DOM API를 사용하여 주식 테이블의 입력 행(tr)과 출력 행(tr)을 생성합니다.
     * @param {CalculatedStock} stock - 주식 데이터 (계산된 지표 포함)
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {DocumentFragment} 생성된 두 개의 <tr> 요소를 포함하는 DocumentFragment
     */
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();

        // --- 입력 행 (trInputs) 생성 ---
        const trInputs = document.createElement('tr');
        trInputs.className = 'stock-inputs';
        trInputs.dataset.id = stock.id;

        const createInput = (type, field, value, placeholder = '', disabled = false, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            input.value = String(value);
            if (placeholder) input.placeholder = placeholder;
            input.disabled = disabled;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
            if (type === 'number') {
                input.min = '0';
                if (field === 'currentPrice' || field === 'fixedBuyAmount') input.step = 'any';
            }
             if (type === 'text') {
                 input.style.textAlign = 'center'; // Center text inputs like name, ticker, sector
             }
            return input;
        };

        const createCheckbox = (field, checked, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.dataset.field = field;
            input.checked = checked;
            if (ariaLabel) input.setAttribute('aria-label', ariaLabel);
            return input;
        };

        const createButton = (action, text, ariaLabel = '', variant = 'grey') => {
            const button = document.createElement('button');
            button.className = 'btn btn--small';
            button.dataset.action = action;
            button.dataset.variant = variant;
            button.textContent = text;
            if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
            return button;
        };

        const appendCellWithContent = (row, content) => {
            const td = row.insertCell();
            if (typeof content === 'string') td.textContent = content;
            else if (content instanceof Node) td.appendChild(content);
            return td;
        };

        appendCellWithContent(trInputs, createInput('text', 'name', stock.name, '종목명'));
        appendCellWithContent(trInputs, createInput('text', 'ticker', stock.ticker, '티커', false, t('aria.tickerInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('text', 'sector', stock.sector || '', '섹터', false, t('aria.sectorInput', { name: stock.name }))); // 섹터 추가
        appendCellWithContent(trInputs, createInput('number', 'targetRatio', stock.targetRatio.toFixed(2), '0.00', false, t('aria.targetRatioInput', { name: stock.name })));
        appendCellWithContent(trInputs, createInput('number', 'currentPrice', stock.currentPrice.toFixed(2), '0.00', false, t('aria.currentPriceInput', { name: stock.name })));

        if (mainMode === 'add') {
            const fixedBuyCell = trInputs.insertCell();
            fixedBuyCell.style.textAlign = 'center';
            const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle'));
            const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount.toFixed(0), '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount'));
            fixedBuyCell.append(checkbox, ' ', amountInput);
        }

        const actionCell = trInputs.insertCell();
        actionCell.style.textAlign = 'center';
        actionCell.append(
            createButton('manage', '거래', t('aria.manageTransactions', { name: stock.name }), 'blue'),
            ' ',
            createButton('delete', '삭제', t('aria.deleteStock', { name: stock.name }), 'delete')
        );

        // --- 출력 행 (trOutputs) 생성 ---
        const trOutputs = document.createElement('tr');
        trOutputs.className = 'stock-outputs';
        trOutputs.dataset.id = stock.id;

        // stock.calculated가 없을 경우 기본값 사용
        const metrics = stock.calculated ?? {
            quantity: new Decimal(0),
            avgBuyPrice: new Decimal(0),
            currentAmount: new Decimal(0),
            profitLoss: new Decimal(0),
            profitLossRate: new Decimal(0)
        };
        const { quantity, avgBuyPrice, currentAmount, profitLoss, profitLossRate } = metrics;
        const profitClass = profitLoss.isNegative() ? 'text-sell' : 'text-buy';
        const profitSign = profitLoss.isPositive() ? '+' : '';

        const createOutputCell = (label, value, valueClass = '') => {
            const td = document.createElement('td');
            td.className = 'output-cell';
            td.style.textAlign = 'right';
            td.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return td;
        };

        const outputColspan = mainMode === 'add' ? 7 : 6; // 입력 행 컬럼 수에 맞춤

        appendCellWithContent(trOutputs, ''); // 첫 번째 빈 셀 (이름 열 아래)
        trOutputs.cells[0].colSpan = 2; // 이름+티커 열 병합
        appendCellWithContent(trOutputs, createOutputCell('수량', quantity.toFixed(0)));
        appendCellWithContent(trOutputs, createOutputCell('평단가', formatCurrency(avgBuyPrice, currency)));
        appendCellWithContent(trOutputs, createOutputCell('현재 평가액', formatCurrency(currentAmount, currency)));
        appendCellWithContent(trOutputs, createOutputCell('평가 손익', `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
        appendCellWithContent(trOutputs, createOutputCell('수익률', `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));

        // colspan 조정
        if(trOutputs.cells.length > 0) {
            trOutputs.cells[0].colSpan = outputColspan - (trOutputs.cells.length -1) > 0 ? outputColspan - (trOutputs.cells.length -1) : 1;
        }


        fragment.append(trInputs, trOutputs);
        return fragment;
    },

    /**
     * @description 특정 주식의 테이블 출력 행(결과 행) 내용을 업데이트합니다.
     * @param {string} id - 업데이트할 주식의 ID
     * @param {CalculatedStock} stock - 새 주식 데이터 (계산된 지표 포함)
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    updateStockRowOutputs(id, stock, currency, mainMode) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        const oldOutputRow = portfolioBody?.querySelector(`.stock-outputs[data-id="${id}"]`);
        if (oldOutputRow) {
             const fragment = this.createStockRowFragment(stock, currency, mainMode);
             const newOutputRow = fragment.querySelector('.stock-outputs');
             if(newOutputRow) {
                 oldOutputRow.replaceWith(newOutputRow); // 기존 행을 새 행으로 교체
             }
        }
    },

    /**
     * @description 모든 주식의 목표 비율 입력 필드 값을 업데이트합니다.
     * @param {Stock[]} portfolioData - 주식 데이터 배열
     * @returns {void}
     */
    updateAllTargetRatioInputs(portfolioData) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        portfolioData.forEach(stock => {
            const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${stock.id}"]`);
            if (!inputRow) return;

            /** @type {HTMLInputElement | null} */
            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (!targetRatioInput) return;

            targetRatioInput.value = stock.targetRatio.toFixed(2);
        });
    },

    /**
     * @description 특정 주식의 '현재가' 입력 필드 값을 업데이트합니다.
     * @param {string} id - 업데이트할 주식의 ID
     * @param {string} price - 새 현재가
     * @returns {void}
     */
    updateCurrentPriceInput(id, price) {
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        const inputRow = portfolioBody?.querySelector(`.stock-inputs[data-id="${id}"]`);
        if (!inputRow) {
            console.warn(`[View] Input row not found for stock ID: ${id}`);
            return;
        }

        /** @type {HTMLInputElement | null} */
        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (!currentPriceInput) {
            console.warn(`[View] Current price input not found for stock ID: ${id}`);
            return;
        }

        currentPriceInput.value = price;
    },

    /**
     * @description 전체 포트폴리오 테이블을 다시 렌더링합니다.
     * @param {CalculatedStock[]} calculatedPortfolioData - 계산된 주식 데이터 배열
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    renderTable(calculatedPortfolioData, currency, mainMode) {
        this.updateTableHeader(currency, mainMode);
        /** @type {HTMLElement | null} */
        const portfolioBody = this.dom.portfolioBody;
        if (!portfolioBody) return;
        portfolioBody.innerHTML = ''; // 기존 내용 비우기

        const fragment = document.createDocumentFragment();
        calculatedPortfolioData.forEach(stock => {
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        });
        portfolioBody.appendChild(fragment);
    },

    /**
     * @description 포트폴리오 테이블 헤더(thead) 내용을 현재 설정에 맞게 업데이트합니다.
     * @param {string} currency - 현재 통화
     * @param {string} mainMode - 현재 계산 모드
     * @returns {void}
     */
    updateTableHeader(currency, mainMode) {
        const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '원';
        // 섹터 헤더 추가
        const fixedBuyHeader = mainMode === 'add' ? `<th scope="col">고정 매수(${currencySymbol})</th>` : '';
        /** @type {HTMLElement | null} */
        const tableHead = this.dom.portfolioTableHead;
        if (!tableHead) return;
        tableHead.innerHTML = `
            <tr role="row">
                <th scope="col" role="columnheader">종목명</th>
                <th scope="col" role="columnheader">티커</th>
                <th scope="col" role="columnheader">섹터</th>
                <th scope="col" role="columnheader">목표 비율(%)</th>
                <th scope="col" role="columnheader">현재가(${currencySymbol})</th>
                ${fixedBuyHeader}
                <th scope="col" role="columnheader">작업</th>
            </tr>`;
    },

     /**
     * @description 고정 매수 금액 열의 표시 여부를 토글합니다.
     * @param {boolean} show - 열을 표시할지 여부
     */
    toggleFixedBuyColumn(show) {
        /** @type {HTMLElement | null} */
        const tableHead = this.dom.portfolioTableHead;
        const portfolioBody = this.dom.portfolioBody;

        // 헤더 업데이트
        const currency = document.querySelector('input[name="currencyMode"]:checked')?.value || 'krw';
        this.updateTableHeader(currency, show ? 'add' : 'sell'); // 헤더 재생성

        // 바디 업데이트 (각 행의 고정 매수 셀 토글)
        portfolioBody?.querySelectorAll('.stock-inputs').forEach(row => {
            // 고정 매수 셀은 항상 6번째 셀 (0-based index 5)이라고 가정
             /** @type {HTMLTableCellElement | undefined} */
            const fixedBuyCell = row.cells[5]; // 고정 매수 컬럼 셀
            if(fixedBuyCell) {
                 fixedBuyCell.style.display = show ? '' : 'none';
            }
             // 작업 셀도 위치 조정 필요할 수 있으나, CSS로 처리하는 것이 나을 수 있음
        });
         portfolioBody?.querySelectorAll('.stock-outputs').forEach(row => {
             // 출력 행의 colspan 조정
             const firstCell = row.cells[0];
             if (firstCell) {
                 const currentOutputCols = row.cells.length;
                 const expectedInputCols = show ? 7 : 6;
                 const neededColspan = expectedInputCols - (currentOutputCols - 1);
                 firstCell.colSpan = neededColspan > 0 ? neededColspan : 1;
             }
         });
    },

    /**
     * @description 테이블 하단의 목표 비율 합계 표시 UI를 업데이트합니다.
     * @param {number} totalRatio - 목표 비율 합계 (0~100+)
     * @returns {void}
     */
    updateRatioSum(totalRatio) {
        /** @type {HTMLElement | null} */
        const ratioSumEl = this.dom.ratioSum;
        /** @type {HTMLElement | null} */
        const ratioValidatorEl = this.dom.ratioValidator;
        if (!ratioSumEl || !ratioValidatorEl) return;

        ratioSumEl.textContent = `${totalRatio.toFixed(1)}%`;
        ratioValidatorEl.classList.remove('valid', 'invalid');
        if (Math.abs(totalRatio - 100) < CONFIG.RATIO_TOLERANCE) {
            ratioValidatorEl.classList.add('valid');
        } else if (totalRatio > 0) { // 0% 초과 시에만 invalid 표시
            ratioValidatorEl.classList.add('invalid');
        }
    },

    /**
     * @description 계산 모드 변경에 따라 UI(추가 투자금 카드 표시 여부 등)를 업데이트합니다.
     * @param {string} mainMode - 선택된 모드 ('add' 또는 'sell')
     * @returns {void}
     */
    updateMainModeUI(mainMode) {
        /** @type {HTMLElement | null} */
        const addCard = this.dom.addInvestmentCard;
        /** @type {NodeListOf<HTMLInputElement>} */
        const modeRadios = this.dom.mainModeSelector;

        addCard?.classList.toggle('hidden', mainMode !== 'add');
        modeRadios?.forEach(radio => {
            radio.checked = radio.value === mainMode;
        });
        this.hideResults(); // 모드 변경 시 이전 결과 숨김
    },

    /**
     * @description 통화 기준 변경에 따라 UI(환율 입력 필드 표시 여부 등)를 업데이트합니다.
     * @param {string} currencyMode - 선택된 통화 ('krw' 또는 'usd')
     * @returns {void}
     */
    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        /** @type {HTMLElement | null} */
        const rateGroup = this.dom.exchangeRateGroup;
        /** @type {HTMLElement | null} */
        const usdGroup = this.dom.usdInputGroup;
        /** @type {NodeListOf<HTMLInputElement>} */
        const currencyRadios = this.dom.currencyModeSelector;
        /** @type {HTMLInputElement | null} */
        const usdInput = this.dom.additionalAmountUSDInput;


        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);
        currencyRadios?.forEach(radio => {
            radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode && usdInput) usdInput.value = '';
    },

    /**
     * @description 거래 내역 관리 모달을 엽니다.
     * @param {Stock} stock - 거래 내역을 관리할 주식 객체
     * @param {string} currency - 현재 통화
     * @returns {void}
     */
    openTransactionModal(stock, currency) {
        this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
        /** @type {HTMLElement | null} */
        const modal = this.dom.transactionModal;
        /** @type {HTMLElement | null} */
        const modalTitle = this.dom.modalStockName;
        /** @type {HTMLInputElement | null} */
        const dateInput = this.dom.txDate;

        if (!modal) return;

        modal.dataset.stockId = stock.id;
        if(modalTitle) modalTitle.textContent = `${escapeHTML(stock.name)} (${escapeHTML(stock.ticker)}) 거래 내역`;
        this.renderTransactionList(stock.transactions || [], currency); // Ensure transactions array exists
        if(dateInput) dateInput.valueAsDate = new Date();
        modal.classList.remove('hidden');
        this._trapFocus(modal);
        /** @type {HTMLButtonElement | null} */
        const closeBtn = this.dom.closeModalBtn;
        closeBtn?.focus();
    },

    /**
     * @description 거래 내역 관리 모달을 닫습니다.
     * @returns {void}
     */
    closeTransactionModal() {
        /** @type {HTMLElement | null} */
        const modal = this.dom.transactionModal;
        /** @type {HTMLFormElement | null} */
        const form = this.dom.newTransactionForm;
        if (!modal) return;

        modal.classList.add('hidden');
        if(form) form.reset();
        modal.removeAttribute('data-stock-id');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
    },

    /**
     * @description 거래 내역 목록(tbody)을 표준 DOM API를 사용하여 렌더링합니다.
     * @param {import('./types.js').Transaction[]} transactions - 거래 내역 배열
     * @param {string} currency - 현재 통화
     * @returns {void}
     */
    renderTransactionList(transactions, currency) {
        /** @type {HTMLTableSectionElement | null} */
        const listBody = this.dom.transactionListBody;
        if (!listBody) return;
        listBody.innerHTML = ''; // 기존 내용 지우기

        /** @type {HTMLTableElement | null} */
        const table = listBody.closest('table'); // 테이블 요소 찾기

        if (transactions.length === 0) {
            if (table) { // 테이블이 있을 때만 행 추가
                const tr = table.insertRow();
                const td = tr.insertCell();
                td.colSpan = 6;
                td.style.textAlign = 'center';
                td.textContent = t('view.noTransactions');
            }
            return;
        }

        // 최신 날짜가 위로 오도록 정렬 (내림차순)
        const sorted = [...transactions].sort((a, b) => {
             const dateCompare = b.date.localeCompare(a.date);
             if (dateCompare !== 0) return dateCompare;
             return b.id.localeCompare(a.id); // 날짜 같으면 ID 역순 (최신 추가된 것 위로)
        });


        sorted.forEach(tx => {
            if (table) { // 테이블이 있을 때만 행 추가
                const tr = table.insertRow();
                tr.dataset.txId = tx.id;
                // quantity와 price가 Decimal 객체일 수 있음
                const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
                const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
                const total = quantityDec.times(priceDec);

                tr.insertCell().textContent = escapeHTML(tx.date); // 날짜
                // 종류
                const typeTd = tr.insertCell();
                const typeSpan = document.createElement('span');
                typeSpan.className = tx.type === 'buy' ? 'text-buy' : 'text-sell';
                typeSpan.textContent = tx.type === 'buy' ? '매수' : '매도';
                typeTd.appendChild(typeSpan);
                // 수량
                const qtyTd = tr.insertCell();
                qtyTd.textContent = quantityDec.toNumber().toLocaleString(); // Decimal -> number 변환
                qtyTd.style.textAlign = 'right';
                // 단가
                const priceTd = tr.insertCell();
                priceTd.textContent = formatCurrency(priceDec, currency); // formatCurrency는 Decimal 처리 가능
                priceTd.style.textAlign = 'right';
                // 총액
                const totalTd = tr.insertCell();
                totalTd.textContent = formatCurrency(total, currency);
                totalTd.style.textAlign = 'right';
                // 작업 버튼
                const actionTd = tr.insertCell();
                actionTd.style.textAlign = 'center';
                const btnDelete = document.createElement('button');
                btnDelete.className = 'btn btn--small';
                btnDelete.dataset.variant = 'delete';
                btnDelete.dataset.action = 'delete-tx';
                btnDelete.textContent = '삭제';
                btnDelete.setAttribute('aria-label', t('aria.deleteTransaction', { date: tx.date }));
                actionTd.appendChild(btnDelete);
            }
        });
    },

    /**
     * @description 계산 결과 영역에 스켈레톤 UI를 표시합니다.
     * @returns {void}
     */
    displaySkeleton() {
        const skeletonHTML = `
            <div class="skeleton-wrapper">
                <div class="skeleton-summary">
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                    <div class="skeleton skeleton-summary-item"></div>
                </div>
                <div class="skeleton-table">
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                    <div class="skeleton skeleton-table-row"><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text--short"></div></div>
                </div>
            </div>
        `;
        /** @type {HTMLElement | null} */
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;
        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * @description 현재 IntersectionObserver 인스턴스를 정리합니다.
     * @returns {void}
     */
    cleanupObserver() {
        if (this.currentObserver) {
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
    },

    /**
     * @description 현재 Chart.js 인스턴스를 파괴합니다.
     * @returns {void}
     */
    destroyChart() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    },

    /**
     * @description View에서 사용하는 자원(Observer, Chart)을 정리합니다.
     * @returns {void}
     */
    cleanup() {
        this.cleanupObserver();
        this.destroyChart();
    },

    /**
     * @description 계산 결과 영역(테이블, 섹터, 차트)을 숨깁니다.
     * @returns {void}
     */
    hideResults() {
        /** @type {HTMLElement | null} */
        const resultsEl = this.dom.resultsSection;
        /** @type {HTMLElement | null} */
        const sectorEl = this.dom.sectorAnalysisSection;
        /** @type {HTMLElement | null} */
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
        this.cleanupObserver(); // 결과 숨길 때 옵저버도 정리
    },

    /**
     * @description 계산 결과 HTML을 화면에 표시하고 스크롤 애니메이션을 적용합니다.
     * @param {string} html - 표시할 HTML 문자열 (결과 테이블 등)
     * @returns {void}
     */
    displayResults(html) {
        requestAnimationFrame(() => {
            /** @type {HTMLElement | null} */
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;

            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;

            this.cleanupObserver(); // 새 결과를 표시하기 전에 이전 옵저버 정리

            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = /** @type {HTMLElement} */ (entry.target);
                        target.style.transitionDelay = target.dataset.delay || '0s';
                        target.classList.add('in-view');
                        this.currentObserver?.unobserve(target); // 관찰 해제
                    }
                });
            }, { threshold: 0.1 });

            rows.forEach((row) => this.currentObserver?.observe(row));
        });
    },

    /**
     * @description 섹터 분석 결과 HTML을 화면에 표시합니다.
     * @param {string} html - 표시할 HTML 문자열
     * @returns {void}
     */
    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            /** @type {HTMLElement | null} */
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;
            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    },

    /**
     * @description Chart.js를 사용하여 도넛 차트를 그리거나 업데이트합니다.
     * @param {any} Chart - Chart.js 라이브러리 객체
     * @param {string[]} labels - 차트 라벨 배열
     * @param {number[]} data - 차트 데이터 배열
     * @param {string} title - 차트 제목
     * @returns {void}
     */
    displayChart(Chart, labels, data, title) {
        /** @type {HTMLElement | null} */
        const chartEl = this.dom.chartSection;
        /** @type {HTMLCanvasElement | null} */
        const canvas = this.dom.portfolioChart; // dom 객체에서 가져오기
        if (!chartEl || !canvas) return;

        chartEl.classList.remove('hidden');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false, // 크기 조절 용이하게
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };

        const chartData = {
            labels: labels,
            datasets: [{
                label: t('template.ratio'), // i18n
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'],
                borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                borderWidth: 2
            }]
        };

        // 기존 차트 인스턴스가 있으면 업데이트, 없으면 새로 생성
        if (this.chartInstance) {
            this.chartInstance.data = chartData;
            // @ts-ignore - Chart.js 타입 정의가 복잡하여 options 할당 에러 무시
            this.chartInstance.options = chartOptions;
            this.chartInstance.update();
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                this.chartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: chartData,
                    options: chartOptions
                });
            }
        }
    },

    /**
     * @description 입력 필드의 유효성 검사 결과에 따라 스타일(테두리 색상 등)을 토글합니다.
     * @param {HTMLElement | HTMLInputElement | null} inputElement - 대상 input 요소 (null 가능성 처리)
     * @param {boolean} isValid - 유효성 여부
     * @param {string} [errorMessage=''] - (선택) 오류 메시지 (현재는 사용 안 함)
     * @returns {void}
     */
    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        // null 체크 추가
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        // TODO: Optionally display errorMessage somewhere near the input, maybe using aria-describedby
    },

    /**
     * @description 화면 상단에 짧은 알림 메시지(토스트)를 표시합니다.
     * @param {string} message - 표시할 메시지
     * @param {'info' | 'success' | 'error'} [type='info'] - 메시지 타입 (색상 결정)
     * @returns {void}
     */
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>'); // 개행 문자 처리
        document.body.appendChild(toast);

        // 3초 후 자동으로 사라짐
        setTimeout(() => toast.remove(), 3000);
    }
};
```

---

## `js/controller.js`

```javascript
// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { debounce, formatCurrency } from './utils.js';
import { CONFIG } from './constants.js';
import { ErrorService } from './errorService.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js'; // 동기 임포트로 복구

/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */

export class PortfolioController {
    /** @type {PortfolioState} */
    state;
    /** @type {PortfolioView} */
    view;
    /** @type {Function} */
    debouncedSave;
    /** @type {string | null} */
    #lastCalculationKey = null;

    /**
     * @param {PortfolioState} state
     * @param {PortfolioView} view
     */
    constructor(state, view) {
        this.state = state;
        this.view = view;
        // Debounce state saving
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);
        
        // Initial setup
        this.setupInitialUI();
    }

    // --- 초기 설정 ---

    setupInitialUI() {
        // 다크 모드 초기 반영 (UX 세부 개선 반영)
        if (localStorage.getItem(CONFIG.DARK_MODE_KEY) === 'true') {
            document.body.classList.add('dark-mode');
        }

        const activePortfolio = this.state.getActivePortfolio();
        if (activePortfolio) {
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.setCurrencyMode(activePortfolio.settings.currentCurrency);
            this.view.setMainMode(activePortfolio.settings.mainMode);
            this.view.updateExchangeRate(activePortfolio.settings.exchangeRate);
            this.view.updateAdditionalAmount(activePortfolio.settings.additionalInvestment || 0, activePortfolio.settings.currentCurrency);

            this.fullRender();
        }
    }

    // --- UI 렌더링 ---

    /**
     * @description 전체 UI를 렌더링하고 상태를 갱신합니다.
     */
    fullRender() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산된 상태 가져오기 (캐시 활용)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 2. 테이블 렌더링
        this.view.renderTable({
            portfolioData: calculatedState.portfolioData,
            currentTotal: calculatedState.currentTotal,
            currentCurrency: activePortfolio.settings.currentCurrency,
            mainMode: activePortfolio.settings.mainMode
        });

        // 3. 비율 합계 업데이트
        const ratioSum = this.state.getRatioSum(); // 동기 호출
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.renderSectorAnalysis(sectorData, activePortfolio.settings.currentCurrency);

        // 5. 활성 모드에 따라 추가 투자금 입력 필드 상태 업데이트
        this.view.toggleAdditionalAmountInputs(activePortfolio.settings.mainMode === 'add');
        
        // 6. 계산된 상태 저장 (결과 뷰에 사용하기 위해)
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    /**
     * @description 인풋 변경 시 UI 상태를 업데이트합니다. (debounce 됨)
     */
    updateUIState() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산된 상태 가져오기 (캐시 활용)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 2. 테이블 출력값만 업데이트
        this.view.updateTableOutputs(calculatedState.portfolioData, activePortfolio.settings.currentCurrency);

        // 3. 비율 합계 업데이트
        const ratioSum = this.state.getRatioSum(); // 동기 호출
        this.view.updateRatioSum(ratioSum.toNumber());

        // 4. 섹터 분석 업데이트
        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.renderSectorAnalysis(sectorData, activePortfolio.settings.currentCurrency);
        
        // 5. 계산된 상태 저장
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }
    
    // --- 포트폴리오 관리 핸들러 ---

    /**
     * @description 새 포트폴리오 생성 버튼 클릭을 처리합니다.
     */
    handleNewPortfolio() {
        const name = prompt(t('prompt.newPortfolioName'));
        if (name) {
            this.state.createNewPortfolio(name);
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
    }

    /**
     * @description 포트폴리오 이름 변경을 처리합니다.
     */
    handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const newName = prompt(t('prompt.renamePortfolio', { name: activePortfolio.settings.portfolioName }));
        if (newName && newName.trim()) {
            this.state.updatePortfolioSettings('portfolioName', newName.trim());
            this.view.initializePortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed', { newName: newName.trim() }), "success");
        }
    }

    /**
     * @description 포트폴리오 삭제를 처리합니다.
     */
    handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.cannotDeleteLastPortfolio'), "error");
            return;
        }

        const confirmDelete = confirm(t('confirm.deletePortfolio', { name: activePortfolio.settings.portfolioName }));
        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (this.state.deletePortfolio(deletedId)) {
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.initializePortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted', { name: activePortfolio.settings.portfolioName }), "success");
                }
            }
        }
    }

    /**
     * @description 포트폴리오 전환을 처리합니다.
     */
    handleSwitchPortfolio() {
        const selector = this.view.getDOMElement('portfolioSelector');
        // @ts-ignore
        const newId = selector?.value;
        if (newId) {
            this.state.setActivePortfolioId(newId);
            const activePortfolio = this.state.getActivePortfolio();
            if (activePortfolio) {
                // UI 설정값 업데이트
                this.view.setCurrencyMode(activePortfolio.settings.currentCurrency);
                this.view.setMainMode(activePortfolio.settings.mainMode);
                this.view.updateExchangeRate(activePortfolio.settings.exchangeRate);
                this.view.updateAdditionalAmount(activePortfolio.settings.additionalInvestment || 0, activePortfolio.settings.currentCurrency);
            }
            this.fullRender();
        }
    }


    // --- 주식/데이터 관리 핸들러 ---

    /**
     * @description 새 주식 추가를 처리합니다.
     */
    handleAddNewStock() {
        this.state.addNewStock();
        this.fullRender(); // 전체 렌더링으로 새 행을 추가하고 포커스 설정
        const newStockId = this.state.getActivePortfolio()?.portfolioData.slice(-1)[0]?.id;
        if (newStockId) {
             this.view.focusOnNewStock(newStockId);
        }
    }

    /**
     * @description 주식 삭제를 처리합니다.
     * @param {string} stockId - 삭제할 주식 ID
     */
    handleDeleteStock(stockId) {
        if (confirm(t('confirm.deleteStock'))) {
            this.state.deleteStock(stockId);
            Calculator.clearPortfolioStateCache();
            this.fullRender();
            this.view.showToast(t('toast.stockDeleted'), "success");
        }
    }

    /**
     * @description 데이터 전체 초기화를 처리합니다.
     */
    handleResetData() {
        if (confirm(t('confirm.resetData'))) {
            this.state.resetData();
            Calculator.clearPortfolioStateCache();
            this.setupInitialUI(); // UI 초기화
            this.view.showToast(t('toast.dataReset'), "success");
        }
    }

    /**
     * @description 목표 비율 정규화를 처리합니다.
     */
    handleNormalizeRatios() {
        try {
            // normalizeRatios는 이제 동기 함수임
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "error");
                return;
            }
            
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            // 업데이트된 비율을 UI에 반영
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            
            // 비율 합계 업데이트 (동기)
            const sum = this.state.getRatioSum();
            this.view.updateRatioSum(sum.toNumber());
            
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");

        } catch (error) {
             ErrorService.handle(/** @type {Error} */ (error), 'handleNormalizeRatios');
             this.view.showToast(t('error.normalizeFailed'), "error");
        }
    }

    /**
     * @description 테이블 본문의 변경(input, checkbox)을 처리합니다.
     * @param {Event} e - Change Event
     * @param {Function} debouncedUpdate - 디바운싱된 UI 업데이트 함수
     */
    handlePortfolioBodyChange(e, debouncedUpdate) {
        const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        const row = target.closest('tr[data-id]');
        if (!row) return;

        const stockId = row.dataset.id;
        const field = target.dataset.field;
        if (!stockId || !field) return;
        
        let value = target.value;
        let isValid = true;
        
        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                value = validationResult.value || 0;
                break;
            case 'isFixedBuyEnabled':
                value = (target instanceof HTMLInputElement) ? target.checked : false;
                break;
            case 'sector':
                value = value.trim() || null;
                break;
            case 'name':
            case 'ticker':
            default:
                value = value.trim();
                break;
        }

        this.view.toggleInputValidation(target, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);
            Calculator.clearPortfolioStateCache(); // 데이터 변경 시 캐시 무효화

            // currentPrice, targetRatio, fixedBuyAmount 변경 시만 debouncedUpdate 호출
            if (['targetRatio', 'currentPrice', 'fixedBuyAmount', 'isFixedBuyEnabled', 'sector'].includes(field)) {
                 debouncedUpdate();
            } else {
                 this.debouncedSave(); // 즉시 저장 (이름, 티커)
            }
        }
    }

    /**
     * @description 테이블 본문의 클릭 이벤트(버튼 등)를 처리합니다.
     * @param {Event} e - Click Event
     */
    handlePortfolioBodyClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const row = target.closest('tr[data-id]');
        if (!row) return;

        const stockId = row.dataset.id;
        if (!stockId) return;

        // 거래 내역 버튼
        if (target.closest('[data-action="open-tx"]')) {
            const stock = this.state.getStockById(stockId);
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (stock && currency) {
                this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
            }
            return;
        }

        // 삭제 버튼
        if (target.closest('[data-action="delete-stock"]')) {
            this.handleDeleteStock(stockId);
            return;
        }
    }


    // --- 계산 및 통화 핸들러 ---

    /**
     * @description 계산 버튼 클릭을 처리합니다.
     */
    handleCalculate() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        // 1. 계산에 필요한 모든 입력값을 모읍니다.
        const { mainMode, additionalAmountInput, exchangeRateInput } = this.view.getDOMElements();
        
        const additionalInvestment = this.getInvestmentAmountInKRW(
             activePortfolio.settings.currentCurrency,
             additionalAmountInput,
             exchangeRateInput
        );
        
        const inputs = {
            mainMode: activePortfolio.settings.mainMode,
            portfolioData: activePortfolio.portfolioData,
            additionalInvestment: additionalInvestment // Decimal 타입
        };

        // 2. 유효성 검사 (동기 호출)
        const validationErrors = Validator.validateForCalculation(inputs);
        
        if (validationErrors.length > 0) {
            this.view.showValidationErrors(validationErrors);
            this.view.showToast(t('toast.validationFailed'), "error");
            this.view.hideResults();
            return;
        }
        
        this.view.clearValidationErrors(); // 에러 초기화

        // 3. 계산 실행 (calculatePortfolioState 호출로 이미 계산된 상태 가정)
        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });
        
        // 4. 리밸런싱 계산
        const rebalancingResults = (activePortfolio.settings.mainMode === 'add')
            ? Calculator.calculateAddRebalancing({
                portfolioData: calculatedState.portfolioData,
                additionalInvestment: additionalInvestment
            })
            : Calculator.calculateSellRebalancing({
                portfolioData: calculatedState.portfolioData
            });

        // 5. 결과 렌더링
        this.view.renderResults({
            mainMode: activePortfolio.settings.mainMode,
            results: rebalancingResults.results,
            currentTotal: calculatedState.currentTotal,
            additionalInvestment: additionalInvestment,
            finalTotal: calculatedState.currentTotal.plus(additionalInvestment),
            currency: activePortfolio.settings.currentCurrency
        });
        
        // 6. 계산된 상태 저장
        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();

        // 7. 토스트 메시지
        this.view.showToast(t('toast.calculationSuccess'), "success");
    }

    /**
     * @description 주식 현재가를 API를 통해 가져옵니다.
     */
    async handleFetchAllPrices() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('toast.noStocksToFetch'), "info");
            return;
        }

        const tickers = activePortfolio.portfolioData.map(s => s.ticker).filter(t => t.trim() !== '');
        if (tickers.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), "info");
            return;
        }

        this.view.toggleFetchButton(true); // 로딩 시작

        try {
            const fetchPromises = tickers.map(ticker => this._fetchPrice(ticker));
            const results = await Promise.allSettled(fetchPromises);

            let successCount = 0;
            let failureCount = 0;

            results.forEach((result, index) => {
                const stock = activePortfolio.portfolioData.find(s => s.ticker === tickers[index]);
                if (!stock) return;
                
                if (result.status === 'fulfilled') {
                    const price = result.value;
                    if (typeof price === 'number' && price > 0) {
                        stock.currentPrice = price;
                        this.view.updateCurrentPriceInput(stock.id, price); // UI 즉시 업데이트
                        successCount++;
                    } else {
                        failureCount++;
                    }
                } else {
                    failureCount++;
                }
            });
            
            Calculator.clearPortfolioStateCache(); // 가격 변경 시 캐시 무효화
            this.updateUIState(); // 최종적으로 UI 출력값 갱신 및 저장
            
            if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccess', { count: successCount }), "success");
            }
            if (failureCount > 0) {
                this.view.showToast(t('api.fetchFailed', { count: failureCount }), "warning");
            }
        } catch (error) {
            // Promise.allSettled 자체는 에러를 던지지 않으므로, 이 catch 블록은 거의 사용되지 않음
            ErrorService.handle(/** @type {Error} */ (error), 'handleFetchAllPrices');
            this.view.showToast(t('api.fetchFailedAll'), "error");
        } finally {
            this.view.toggleFetchButton(false); // 로딩 종료
        }
    }

    /**
     * @description 단일 주식의 현재 가격을 API에서 가져옵니다.
     * @param {string} ticker - 주식 티커
     * @returns {Promise<number>} 현재 가격
     */
    async _fetchPrice(ticker) {
        if (!ticker || ticker.trim() === '') {
            throw new Error('Ticker is empty.');
        }

        // Vite 프록시 설정에 의해 /api/price 요청은 Finnhub API로 라우팅됨
        const url = `/api/price?symbol=${encodeURIComponent(ticker)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); // 8초 타임아웃
        
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        // Finnhub API 구조: { c: current_price }
        const price = data.c;
        if (typeof price !== 'number' || price <= 0) {
            throw new Error('Invalid price received.');
        }

        return price;
    }

    /**
     * @description 현재 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'add' | 'sell'} newMode
     */
    handleMainModeChange(newMode) {
        this.state.updatePortfolioSettings('mainMode', newMode);
        this.view.setMainMode(newMode);
        this.view.toggleAdditionalAmountInputs(newMode === 'add');
        this.fullRender();
        this.view.showToast(t('toast.modeChanged', { mode: newMode === 'add' ? t('mode.add') : t('mode.sell') }), "info");
    }

    /**
     * @description 통화 모드를 업데이트하고 UI를 갱신합니다.
     * @param {'KRW' | 'USD'} newCurrency
     */
    handleCurrencyModeChange(newCurrency) {
        this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        this.view.setCurrencyMode(newCurrency);
        this.fullRender();
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency }), "info");
    }

    /**
     * @description 통화 및 환율 변경을 처리합니다. (Debounce 됨)
     * @param {'krw' | 'usd'} source - 입력이 발생한 필드
     */
    handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;
        
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.getDOMElements();

        // 1. 환율 업데이트 및 검증
        const exchangeRate = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRate > 0;
        
        if (isValidRate) {
            this.state.updatePortfolioSettings('exchangeRate', exchangeRate);
        } else {
            // 환율 입력이 유효하지 않으면 기본값 사용
             this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
             this.view.updateExchangeRate(CONFIG.DEFAULT_EXCHANGE_RATE);
             // 그리고 경고 표시
             this.view.showToast(t('error.invalidExchangeRate'), "error");
             return;
        }

        // 2. 추가 투자금액 업데이트 및 변환
        let krwAmount = 0;
        let usdAmount = 0;
        
        if (source === 'krw') {
            krwAmount = Number(additionalAmountInput.value) || 0;
            usdAmount = krwAmount / exchangeRate;
        } else { // source === 'usd'
            usdAmount = Number(additionalAmountUSDInput.value) || 0;
            krwAmount = usdAmount * exchangeRate;
        }
        
        // 3. 상태 및 UI 업데이트
        const currentCurrency = activePortfolio.settings.currentCurrency;
        const finalAmount = (currentCurrency === 'KRW' ? krwAmount : usdAmount) || 0;

        this.state.updatePortfolioSettings('additionalInvestment', finalAmount);

        // 상호 보완적인 입력 필드만 업데이트
        if (source === 'krw') {
            this.view.updateAdditionalAmount(usdAmount, 'USD');
        } else {
            this.view.updateAdditionalAmount(krwAmount, 'KRW');
        }

        this.debouncedSave();
    }


    // --- 거래 내역 모달 핸들러 ---

    /**
     * @description 새 거래 추가 폼 제출을 처리합니다.
     * @param {Event} e - Form Submit Event
     */
    handleAddNewTransaction(e) {
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        const stockId = form.dataset.stockId;
        if (!stockId) return;

        const formData = new FormData(form);
        const type = formData.get('type') === 'sell' ? 'sell' : 'buy';
        const date = String(formData.get('date'));
        const quantity = Number(formData.get('quantity'));
        const price = Number(formData.get('price'));

        const txData = { type, date, quantity, price };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.transactionValidationFailed'), "error");
            return;
        }

        this.state.addTransaction(stockId, { type, date, quantity, price });
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (currency) {
             this.view.updateTransactionList(stockId, this.state.getTransactions(stockId), currency);
        }
        form.reset();
        this.view.showToast(t('toast.transactionAdded'), "success");

        // 상태 변경 후 UI 업데이트
        Calculator.clearPortfolioStateCache();
        this.updateUIState();
    }

    /**
     * @description 거래 목록 내 삭제 버튼 클릭을 처리합니다.
     * @param {Event} e - Click Event
     */
    handleTransactionListClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('[data-action="delete-tx"]');
        if (!deleteButton) return;

        const stockId = deleteButton.dataset.stockId;
        const txId = deleteButton.dataset.txId;

        if (stockId && txId && confirm(t('confirm.deleteTransaction'))) {
            this.state.deleteTransaction(stockId, txId);
            const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
            if (currency) {
                 this.view.updateTransactionList(stockId, this.state.getTransactions(stockId), currency);
            }
            this.view.showToast(t('toast.transactionDeleted'), "success");

            // 상태 변경 후 UI 업데이트
            Calculator.clearPortfolioStateCache();
            this.updateUIState();
        }
    }


    // --- 기타 핸들러 ---

    /**
     * @description 다크 모드 토글을 처리합니다.
     */
    handleToggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
    }

    /**
     * @description 페이지 닫기 전 데이터를 저장합니다.
     */
    handleSaveDataOnExit() {
        // 비동기 디바운스 함수가 완료될 시간이 없을 수 있으므로 동기적으로 저장
        this.state.saveActivePortfolio();
        this.state.saveMeta();
    }
    
    /**
     * @description 파일 임포트 버튼 클릭을 처리합니다. (파일 선택창을 엽니다)
     */
    handleImportData() {
        const fileInput = this.view.getDOMElement('importFileInput');
        fileInput?.click();
    }
    
    /**
     * @description 파일 선택 후 변경 이벤트를 처리합니다.
     * @param {Event} e - Change Event (on file input)
     */
    handleFileSelected(e) {
        const fileInput = /** @type {HTMLInputElement} */ (e.target);
        const file = fileInput.files?.[0];
        
        if (file) {
            if (file.type !== 'application/json') {
                this.view.showToast(t('error.invalidFileType'), "error");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonString = event.target?.result;
                    if (typeof jsonString === 'string') {
                        const loadedData = JSON.parse(jsonString);
                        
                        // 기본 구조 검증 (세부 검증은 State 내부에서 진행)
                        if (Validator.isDataStructureValid(loadedData)) {
                             this.state.importData(loadedData);
                             this.view.initializePortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
                             this.fullRender();
                             this.view.showToast(t('toast.dataImportSuccess'), "success");
                        } else {
                            throw new Error('Data structure validation failed.');
                        }
                    }
                } catch (error) {
                    ErrorService.handle(/** @type {Error} */ (error), 'handleFileSelected - Parsing');
                    this.view.showToast(t('error.dataImportFailed'), "error");
                } finally {
                    // Reset the input value to allow the same file to be loaded again
                    fileInput.value = '';
                }
            };
            reader.readAsText(file);
        }
    }
    
    /**
     * @description 데이터 내보내기 버튼 클릭을 처리합니다.
     */
    handleExportData() {
        try {
            const dataToExport = this.state.exportData();
            const jsonString = JSON.stringify(dataToExport, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const activePortfolio = this.state.getActivePortfolio();
            const filename = `portfolio_data_${activePortfolio?.settings.portfolioName || 'export'}_${Date.now()}.json`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace(/\s+/g, '_'); // 공백 제거
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.view.showToast(t('toast.dataExportSuccess'), "success");

        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleExportData');
            this.view.showToast(t('error.dataExportFailed'), "error");
        }
    }
    
    /**
     * @description 입력된 금액을 현재 통화 설정 및 환율을 고려하여 KRW 기준으로 변환합니다.
     * @param {'KRW' | 'USD'} currentCurrency - 현재 설정된 통화
     * @param {HTMLInputElement} krwInput - 원화 입력 필드
     * @param {HTMLInputElement} exchangeRateInput - 환율 입력 필드
     * @returns {Decimal} KRW로 변환된 금액
     */
    getInvestmentAmountInKRW(currentCurrency, krwInput, exchangeRateInput) {
        const amount = Number(krwInput.value) || 0;
        const exchangeRate = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;

        if (currentCurrency === 'KRW') {
            return new Decimal(amount);
        } else { // USD
            const amountUSD = Number(this.view.getDOMElement('additionalAmountUSDInput').value) || 0;
            return new Decimal(amountUSD).times(exchangeRate);
        }
    }
}
```

---

## `js/controller.test.js`

```javascript
// js/controller.test.js (수정본)
// @ts-check

import { describe, it, expect, vi, beforeEach } from 'vitest'; // Vitest import는 맨 위

// --- 👇 vi.mock 호출을 import 구문 위로 이동 ---
vi.mock('./state.js'); // PortfolioState 생성자를 자동으로 모의 처리
vi.mock('./view.js', () => ({
  PortfolioView: { // view 객체와 필요한 함수들을 모의 처리
    cacheDomElements: vi.fn(),
    displaySkeleton: vi.fn(),
    displayResults: vi.fn(),
    hideResults: vi.fn(),
    showToast: vi.fn(),
    showConfirm: vi.fn(),
    // ... 다른 필요한 view 모의 함수들을 여기에 추가 ...
    updateTableHeader: vi.fn(),
    toggleFixedBuyColumn: vi.fn(),
    updateMainModeUI: vi.fn(),
    renderPortfolioSelector: vi.fn(),
    renderTable: vi.fn(),
    updateCurrencyModeUI: vi.fn(),
    updateRatioSum: vi.fn(),
    cleanup: vi.fn(),
  }
}));
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js'); // Calculator도 모의 처리
// --- 👆 여기까지 ---

// --- 👇 실제 모듈 import는 mock 호출 아래에 ---
import { PortfolioController } from './controller.js';
import { Validator } from './validator.js'; // 실제 Validator 사용 시 필요 (테스트 내에서)
import { ErrorService, ValidationError } from './errorService.js'; // 실제 ErrorService 사용 시 필요 (테스트 내에서)
// Calculator는 Controller 내부에서만 사용되므로 테스트 파일에서 직접 import할 필요는 없을 수 있습니다.
// PortfolioState는 자동으로 모의 처리되었으므로 여기서 import하지 않습니다.

// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  /** @type {PortfolioController} */
  let controller;

  beforeEach(() => {
    // 매 테스트 전에 모든 모의 함수의 호출 기록을 초기화합니다.
    vi.clearAllMocks();

    // PortfolioState 모의 생성자 설정 (필요한 경우)
    // vi.mocked(PortfolioState).mockImplementation(() => {
    //   return { /* 모의 state 객체의 필요한 메소드/속성 구현 */ };
    // });

    // @ts-ignore - PortfolioState가 모의 처리되었으므로 타입 에러 무시
    controller = new PortfolioController();

    // Controller의 내부 헬퍼 함수들도 모의 처리하여
    // 'handleCalculate' 자체의 로직만 테스트합니다.
    // (이 모의 함수들은 controller 인스턴스 생성 *후*에 설정해야 합니다)
    controller._getInputsForCalculation = vi.fn().mockResolvedValue({ // Promise 반환하도록 수정
      settings: { mainMode: 'add', currentCurrency: 'krw' }, // settings 객체 추가
      portfolioData: [], // portfolioData 추가
      calculatedPortfolioData: [],
      additionalInvestment: { /* Decimal 모의 객체 또는 실제 Decimal 값 */ isZero: () => false, isNegative: () => false } // Decimal 객체 모의
    });
    controller._runRebalancingLogic = vi.fn().mockResolvedValue({ results: [], summary: {} });
    controller._updateResultsView = vi.fn().mockResolvedValue(undefined);
  });

  // 테스트 1: 유효성 검사 실패 시나리오
  it('handleCalculate: 유효성 검사 실패 시 ErrorService를 호출해야 한다', async () => {
    // [Arrange] 준비
    const validationError = new ValidationError('- 테스트 오류');
    // Validator가 에러 메시지 배열을 반환하도록 설정 (Promise 반환하도록 수정)
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockResolvedValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    // [Act] 실행
    await controller.handleCalculate();

    // [Assert] 검증
    expect(controller.view.displaySkeleton).toHaveBeenCalledOnce(); // 1. 스켈레톤 표시
    expect(Validator.validateForCalculation).toHaveBeenCalledOnce(); // 2. 유효성 검사 호출
    expect(controller.view.hideResults).toHaveBeenCalledOnce(); // 3. (실패 시) 결과 숨김
    // ErrorService.handle의 첫 번째 인자가 ValidationError 인스턴스인지 확인
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate'); // 4. 에러 핸들러 호출

    // 5. (중요) 계산 로직과 뷰 업데이트는 호출되면 안 됨
    expect(controller._runRebalancingLogic).not.toHaveBeenCalled();
    expect(controller._updateResultsView).not.toHaveBeenCalled();
  });

  // 테스트 2: 유효성 검사 성공 시나리오
  it('handleCalculate: 유효성 검사 성공 시 계산 및 뷰 업데이트를 호출해야 한다', async () => {
    // [Arrange] 준비
    const mockResults = { results: [ { id: '1' } ], summary: { total: 100 } };
    const mockInputs = {
        settings: { mainMode: 'add', currentCurrency: 'krw' }, // settings 객체 구조 맞추기
        portfolioData: [{id: 'stock1-data'}], // portfolioData 추가
        calculatedPortfolioData: [ { id: 'stock1', calculated: {} } ], // calculatedPortfolioData 구조 맞추기
        additionalInvestment: { /* Decimal 모의 객체 */ isZero: () => false, isNegative: () => false }
    };
    // @ts-ignore
    controller._getInputsForCalculation.mockResolvedValue(mockInputs); // Promise 반환하도록 수정
    // @ts-ignore
    vi.mocked(Validator.validateForCalculation).mockResolvedValue([]); // 유효성 검사 통과 (빈 배열 Promise)
    controller._runRebalancingLogic.mockResolvedValue(mockResults);

    // [Act] 실행
    await controller.handleCalculate();

    // [Assert] 검증
    expect(controller.view.displaySkeleton).toHaveBeenCalledOnce(); // 1. 스켈레톤 표시
    expect(Validator.validateForCalculation).toHaveBeenCalledOnce(); // 2. 유효성 검사 호출

    // 3. (중요) 계산 로직과 뷰 업데이트가 올바른 인자와 함께 호출되어야 함
    expect(controller._runRebalancingLogic).toHaveBeenCalledWith(mockInputs);
    expect(controller._updateResultsView).toHaveBeenCalledWith(
        mockInputs.settings.mainMode,
        mockResults,
        mockInputs.settings.currentCurrency.toUpperCase(), // 통화 코드는 대문자로 전달
        mockInputs.calculatedPortfolioData
    );

    // 4. (중요) 실패 로직은 호출되면 안 됨
    expect(controller.view.hideResults).not.toHaveBeenCalled();
    expect(ErrorService.handle).not.toHaveBeenCalled();
  });

  // ... (다른 Controller 메소드들에 대한 테스트 케이스 추가 가능) ...

});
```

---

## `js/calculator.test.js`

```javascript
// js/calculator.test.js
// @ts-check

import { describe, it, expect, vi } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator.js';

// --- Helper for creating base stock data ---
/**
 * @param {string} id
 * @param {number} targetRatio
 * @param {number} currentAmount
 * @param {import('./types.js').Transaction[]} [transactions=[]]
 * @returns {import('./types.js').CalculatedStock}
 */
function createMockStock(id, targetRatio, currentAmount, transactions = []) {
    // 현재 테스트는 calculated 속성을 직접 설정하는 방식에 의존
    return {
        id: id, 
        name: `Stock ${id}`, 
        ticker: id.toUpperCase(), 
        sector: 'Test', 
        targetRatio: targetRatio, 
        currentPrice: 1, // 가격은 1로 고정하여 금액 = 수량으로 단순화
        isFixedBuyEnabled: false, 
        fixedBuyAmount: 0, 
        transactions: transactions,
        calculated: { 
            quantity: new Decimal(currentAmount), 
            avgBuyPrice: new Decimal(1), 
            currentAmount: new Decimal(currentAmount), 
            profitLoss: new Decimal(0), 
            profitLossRate: new Decimal(0),
        },
    };
}


describe('Calculator.calculateStockMetrics (동기)', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 150,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(100) },
                { id:'t2', type: 'buy', date: '2023-01-02', quantity: new Decimal(10), price: new Decimal(120) },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: [] // Add cache property
        };
        stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()); // Pre-sort
        const result = Calculator.calculateStockMetrics(stock); // 동기 호출
        expect(result.netQuantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110');
        expect(result.currentAmount.toString()).toBe('3000'); // 20 * 150
        expect(result.profitLoss.toString()).toBe('800'); // 3000 - 2200
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 200,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(100) },
                { id:'t2', type: 'sell', date: '2023-01-02', quantity: new Decimal(5), price: new Decimal(150) },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: []
        };
         stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
        const result = Calculator.calculateStockMetrics(stock); // 동기 호출
        expect(result.netQuantity.toString()).toBe('5');
        expect(result.avgBuyPrice.toString()).toBe('100');
        expect(result.currentAmount.toString()).toBe('1000'); // 5 * 200
        expect(result.profitLoss.toString()).toBe('500'); // 1000 - 500
    });
});

describe('Calculator.calculateSellRebalancing (동기)', () => {
  it('목표 비율에 맞게 매도 및 매수해야 할 금액을 정확히 계산해야 한다', () => {
    const portfolioData = [
      createMockStock('s1', 25, 5000), // 5000원
      createMockStock('s2', 75, 5000)  // 5000원
    ];
    // @ts-ignore
    const { results } = Calculator.calculateSellRebalancing({ portfolioData }); // 동기 호출
    const overweightStock = results.find(s => s.id === 's1');
    const underweightStock = results.find(s => s.id === 's2');
    
    // 총액 10000원. 목표: 2500원(s1), 7500원(s2)
    expect(overweightStock?.adjustment.toString()).toBe('2500'); // Sell 2500
    expect(underweightStock?.adjustment.toString()).toBe('-2500'); // Buy 2500
  });
});

describe('Calculator.calculateAddRebalancing (동기)', () => {
  it('추가 투자금을 목표 비율에 미달하는 주식에 정확히 배분해야 한다', () => {
    const portfolioData = [
      createMockStock('s1', 50, 1000), // 저체중
      createMockStock('s2', 50, 3000)  // 과체중
    ];
    const additionalInvestment = new Decimal(1000);
    // @ts-ignore
    const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment }); // 동기 호출
    const underweightStock = results.find(s => s.id === 's1');
    const overweightStock = results.find(s => s.id === 's2');
    
    // 총액: 4000 (기존) + 1000 (추가) = 5000원. 목표: 2500원(s1), 2500원(s2)
    // s1 부족분: 2500 - 1000 = 1500원
    // s2 부족분: max(0, 2500 - 3000) = 0원
    // 총 부족분: 1500원. 추가 투자금 1000원은 s1에 모두 배분.
    expect(underweightStock?.finalBuyAmount.toString()).toBe('1000');
    expect(overweightStock?.finalBuyAmount.toString()).toBe('0');
  });
});

// ⬇️ [추가] 엣지 케이스 테스트 스위트
describe('Calculator Edge Cases (동기)', () => {

    describe('calculateStockMetrics', () => {
        it('매도 수량이 보유 수량을 초과하면 보유 수량만큼만 매도되어야 함', () => {
             const stock = {
                id: 's1', name: 'OverSell', ticker: 'OVER', sector: '', targetRatio: 100, currentPrice: 100,
                transactions: [
                    { id:'t1', type: 'buy', date: '2023-01-01', quantity: new Decimal(10), price: new Decimal(50) },
                    { id:'t2', type: 'sell', date: '2023-01-02', quantity: new Decimal(15), price: new Decimal(80) } // 보유량(10)보다 많이 매도 시도
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0, _sortedTransactions: []
            };
            stock._sortedTransactions = [...stock.transactions].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
            const result = Calculator.calculateStockMetrics(stock); // 동기 호출
            expect(result.netQuantity.toString()).toBe('0'); // 최종 수량은 0
            expect(result.avgBuyPrice.toString()).toBe('0');
        });
    });

    describe('calculateAddRebalancing', () => {
        it('추가 투자금이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
             const portfolioData = [
                createMockStock('s1', 50, 1000),
                createMockStock('s2', 50, 1000)
            ];
            const additionalInvestment = new Decimal(0); // 추가 투자금 0
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
            expect(results[0].buyRatio.toString()).toBe('0');
            expect(results[1].buyRatio.toString()).toBe('0');
        });

        it('모든 종목의 목표 비율이 0이면 매수 추천 금액은 모두 0이어야 함', () => {
            const portfolioData = [
                createMockStock('s1', 0, 1000), // 목표 0%
                createMockStock('s2', 0, 1000)
            ];
            const additionalInvestment = new Decimal(1000);
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            expect(results[0].finalBuyAmount.toString()).toBe('0');
            expect(results[1].finalBuyAmount.toString()).toBe('0');
        });

         it('고정 매수 금액이 추가 투자금을 초과하면, 고정 매수분만 할당되고 나머지는 0 (Validator가 막아야 함)', () => {
            const portfolioData = [
                { ...createMockStock('s1', 50, 1000), isFixedBuyEnabled: true, fixedBuyAmount: 1500 }, // 고정 1500
                createMockStock('s2', 50, 1000)
            ];
            const additionalInvestment = new Decimal(1000); // 총 투자금 1000
            // @ts-ignore
            const { results } = Calculator.calculateAddRebalancing({ portfolioData, additionalInvestment });
            
            // s1은 고정 매수가 그대로 반영됨 (1500)
            expect(results.find(r => r.id === 's1')?.finalBuyAmount.toString()).toBe('1500'); 
            // s2는 남은 투자금이 음수이므로 0이 할당되어야 함
            expect(results.find(r => r.id === 's2')?.finalBuyAmount.toString()).toBe('0'); 
            // 참고: Validator가 이 상황을 막는 것이 올바른 디자인 패턴임.
         });
    });
});
```

---

## `js/validator.test.js`

```javascript
import { describe, it, expect } from 'vitest';
import { Validator } from './validator.js';
import Decimal from 'decimal.js';

describe('Validator.validateNumericInput', () => {
  it('유효한 숫자를 올바르게 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput(123)).toEqual({ isValid: true, value: 123 });
  });

  it('문자열 형태의 숫자를 올바르게 변환해야 합니다.', () => {
    expect(Validator.validateNumericInput('45.6')).toEqual({ isValid: true, value: 45.6 });
  });

  it('빈 문자열을 0으로 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput('')).toEqual({ isValid: true, value: 0 });
  });

  it('음수를 유효하지 않다고 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput(-10)).toEqual({ isValid: false, message: '음수는 입력할 수 없습니다.' });
  });

  it('숫자가 아닌 문자열을 유효하지 않다고 처리해야 합니다.', () => {
    expect(Validator.validateNumericInput('abc')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
  });
});

describe('Validator.validateTransaction', () => {
  const today = new Date().toISOString().slice(0, 10);

  it('유효한 거래 데이터를 통과시켜야 합니다.', () => {
    const validTx = { date: today, quantity: 10, price: 100 };
    expect(Validator.validateTransaction(validTx).isValid).toBe(true);
  });

  it('미래 날짜를 거부해야 합니다.', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureTx = { date: futureDate.toISOString().slice(0, 10), quantity: 1, price: 100 };
    expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
    expect(Validator.validateTransaction(futureTx).message).toBe('미래 날짜는 입력할 수 없습니다.');
  });

  it('잘못된 날짜 형식을 거부해야 합니다.', () => {
    const invalidTx = { date: '2023-99-99', quantity: 1, price: 100 };
    expect(Validator.validateTransaction(invalidTx).isValid).toBe(false);
  });

  it('0 또는 음수 수량을 거부해야 합니다.', () => {
    const zeroQtyTx = { date: today, quantity: 0, price: 100 };
    const negativeQtyTx = { date: today, quantity: -5, price: 100 };
    expect(Validator.validateTransaction(zeroQtyTx).isValid).toBe(false);
    expect(Validator.validateTransaction(negativeQtyTx).isValid).toBe(false);
  });

  it('0 또는 음수 단가를 거부해야 합니다.', () => {
    const zeroPriceTx = { date: today, quantity: 10, price: 0 };
    const negativePriceTx = { date: today, quantity: 10, price: -50 };
    expect(Validator.validateTransaction(zeroPriceTx).isValid).toBe(false);
    expect(Validator.validateTransaction(negativePriceTx).isValid).toBe(false);
  });
});
```

---

## `js/decimalLoader.js`

```javascript
// js/decimalLoader.js (새 파일)
// @ts-check

/** @type {typeof import('decimal.js') | null} */
let DecimalLib = null;

/**
 * @description Decimal.js 라이브러리를 비동기적으로 로드하고 클래스를 반환합니다.
 * 한 번 로드된 후에는 캐시된 클래스를 반환합니다.
 * @returns {Promise<typeof import('decimal.js')>} Decimal 클래스 생성자 Promise
 */
export async function getDecimal() {
    if (!DecimalLib) {
        console.log("Loading Decimal.js library...");
        try {
            // 동적 import 사용
            const decimalModule = await import('decimal.js');
            DecimalLib = decimalModule.default; // default export 가져오기
            // Decimal 설정 (로드 후 한 번만 수행)
            DecimalLib.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
            console.log("Decimal.js loaded and configured.");
        } catch (error) {
            console.error("Failed to load Decimal.js:", error);
            throw new Error("Could not load essential Decimal library."); // 로드 실패 시 에러 발생
        }
    }
    // @ts-ignore - DecimalLib is guaranteed to be non-null here after await
    return DecimalLib;
}

/**
 * @description Decimal 객체를 생성하는 비동기 헬퍼 함수. 라이브러리가 로드되지 않았으면 로드합니다.
 * @param {import('decimal.js').Decimal.Value} value - Decimal로 변환할 값
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function createDecimal(value) {
    const DecimalConstructor = await getDecimal();
    return new DecimalConstructor(value);
}

/**
 * @description Decimal.max 함수를 비동기로 호출하는 헬퍼 함수.
 * @param {import('decimal.js').Decimal.Value} value1
 * @param {import('decimal.js').Decimal.Value} value2
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function decimalMax(value1, value2) {
    const DecimalConstructor = await getDecimal();
    // Use DecimalConstructor.max static method
    return DecimalConstructor.max(value1, value2);
}

/**
 * @description Decimal.min 함수를 비동기로 호출하는 헬퍼 함수.
 * @param {import('decimal.js').Decimal.Value} value1
 * @param {import('decimal.js').Decimal.Value} value2
 * @returns {Promise<import('decimal.js').Decimal>} Decimal 인스턴스 Promise
 */
export async function decimalMin(value1, value2) {
    const DecimalConstructor = await getDecimal();
     // Use DecimalConstructor.min static method
    return DecimalConstructor.min(value1, value2);
}
```