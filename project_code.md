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
    "vite": "^7.1.12",
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
        "jsdom": "^24.1.0",
        "vite": "^7.1.12",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.11.tgz",
      "integrity": "sha512-Xt1dOL13m8u0WE8iplx9Ibbm+hFAO0GsU2P34UNoDGvZYkY8ifSiy6Zuc1lYxfG7svWE2fzqCUmFp5HCn51gJg==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.11.tgz",
      "integrity": "sha512-uoa7dU+Dt3HYsethkJ1k6Z9YdcHjTrSb5NUy66ZfZaSV8hEYGD5ZHbEMXnqLFlbBflLsl89Zke7CAdDJ4JI+Gg==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.11.tgz",
      "integrity": "sha512-9slpyFBc4FPPz48+f6jyiXOx/Y4v34TUeDDXJpZqAWQn/08lKGeD8aDp9TMn9jDz2CiEuHwfhRmGBvpnd/PWIQ==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.11.tgz",
      "integrity": "sha512-Sgiab4xBjPU1QoPEIqS3Xx+R2lezu0LKIEcYe6pftr56PqPygbB7+szVnzoShbx64MUupqoE0KyRlN7gezbl8g==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.11.tgz",
      "integrity": "sha512-VekY0PBCukppoQrycFxUqkCojnTQhdec0vevUL/EDOCnXd9LKWqD/bHwMPzigIJXPhC59Vd1WFIL57SKs2mg4w==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.11.tgz",
      "integrity": "sha512-+hfp3yfBalNEpTGp9loYgbknjR695HkqtY3d3/JjSRUyPg/xd6q+mQqIb5qdywnDxRZykIHs3axEqU6l1+oWEQ==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.11.tgz",
      "integrity": "sha512-CmKjrnayyTJF2eVuO//uSjl/K3KsMIeYeyN7FyDBjsR3lnSJHaXlVoAK8DZa7lXWChbuOk7NjAc7ygAwrnPBhA==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.11.tgz",
      "integrity": "sha512-Dyq+5oscTJvMaYPvW3x3FLpi2+gSZTCE/1ffdwuM6G1ARang/mb3jvjxs0mw6n3Lsw84ocfo9CrNMqc5lTfGOw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.11.tgz",
      "integrity": "sha512-TBMv6B4kCfrGJ8cUPo7vd6NECZH/8hPpBHHlYI3qzoYFvWu2AdTvZNuU/7hsbKWqu/COU7NIK12dHAAqBLLXgw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.11.tgz",
      "integrity": "sha512-Qr8AzcplUhGvdyUF08A1kHU3Vr2O88xxP0Tm8GcdVOUm25XYcMPp2YqSVHbLuXzYQMf9Bh/iKx7YPqECs6ffLA==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.11.tgz",
      "integrity": "sha512-TmnJg8BMGPehs5JKrCLqyWTVAvielc615jbkOirATQvWWB1NMXY77oLMzsUjRLa0+ngecEmDGqt5jiDC6bfvOw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.11.tgz",
      "integrity": "sha512-DIGXL2+gvDaXlaq8xruNXUJdT5tF+SBbJQKbWy/0J7OhU8gOHOzKmGIlfTTl6nHaCOoipxQbuJi7O++ldrxgMw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.11.tgz",
      "integrity": "sha512-Osx1nALUJu4pU43o9OyjSCXokFkFbyzjXb6VhGIJZQ5JZi8ylCQ9/LFagolPsHtgw6himDSyb5ETSfmp4rpiKQ==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.11.tgz",
      "integrity": "sha512-nbLFgsQQEsBa8XSgSTSlrnBSrpoWh7ioFDUmwo158gIm5NNP+17IYmNWzaIzWmgCxq56vfr34xGkOcZ7jX6CPw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.11.tgz",
      "integrity": "sha512-HfyAmqZi9uBAbgKYP1yGuI7tSREXwIb438q0nqvlpxAOs3XnZ8RsisRfmVsgV486NdjD7Mw2UrFSw51lzUk1ww==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.11.tgz",
      "integrity": "sha512-HjLqVgSSYnVXRisyfmzsH6mXqyvj0SA7pG5g+9W7ESgwA70AXYNpfKBqh1KbTxmQVaYxpzA/SvlB9oclGPbApw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.11.tgz",
      "integrity": "sha512-HSFAT4+WYjIhrHxKBwGmOOSpphjYkcswF449j6EjsjbinTZbp8PJtjsVK1XFJStdzXdy/jaddAep2FGY+wyFAQ==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.11.tgz",
      "integrity": "sha512-hr9Oxj1Fa4r04dNpWr3P8QKVVsjQhqrMSUzZzf+LZcYjZNqhA3IAfPQdEh1FLVUJSiu6sgAwp3OmwBfbFgG2Xg==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.11.tgz",
      "integrity": "sha512-u7tKA+qbzBydyj0vgpu+5h5AeudxOAGncb8N6C9Kh1N4n7wU1Xw1JDApsRjpShRpXRQlJLb9wY28ELpwdPcZ7A==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.11.tgz",
      "integrity": "sha512-Qq6YHhayieor3DxFOoYM1q0q1uMFYb7cSpLD2qzDSvK1NAvqFi8Xgivv0cFC6J+hWVw2teCYltyy9/m/14ryHg==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.11.tgz",
      "integrity": "sha512-CN+7c++kkbrckTOz5hrehxWN7uIhFFlmS/hqziSFVWpAzpWrQoAG4chH+nN3Be+Kzv/uuo7zhX716x3Sn2Jduw==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.11.tgz",
      "integrity": "sha512-rOREuNIQgaiR+9QuNkbkxubbp8MSO9rONmwP5nKncnWJ9v5jQ4JxFnLu4zDSRPf3x4u+2VN4pM4RdyIzDty/wQ==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.11.tgz",
      "integrity": "sha512-nq2xdYaWxyg9DcIyXkZhcYulC6pQ2FuCgem3LI92IwMgIZ69KHeY8T4Y88pcwoLIjbed8n36CyKoYRDygNSGhA==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.11.tgz",
      "integrity": "sha512-3XxECOWJq1qMZ3MN8srCJ/QfoLpL+VaxD/WfNRm1O3B4+AZ/BnLVgFbUV3eiRYDMXetciH16dwPbbHqwe1uU0Q==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.11.tgz",
      "integrity": "sha512-3ukss6gb9XZ8TlRyJlgLn17ecsK4NSQTmdIXRASVsiS2sQ6zPPZklNJT5GR5tE/MUarymmy8kCEf5xPCNCqVOA==",
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.11.tgz",
      "integrity": "sha512-D7Hpz6A2L4hzsRpPaCYkQnGOotdUpDzSGRIv9I+1ITdHROSFUWW95ZPZWQmGka1Fg7W3zFJowyn9WGwMJ0+KPA==",
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
    "node_modules/@types/estree": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.8.tgz",
      "integrity": "sha512-dWHzHa2WqEXI/O1E9OjrocMTKJl2mSrEolh1Iomrv6U+JuNwaHXsXx9bLu5gG7BUWFIN0skIQJQ/L1rIex4X6w==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/trusted-types": {
      "version": "2.0.7",
      "resolved": "https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz",
      "integrity": "sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/@vitest/expect": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/expect/-/expect-4.0.3.tgz",
      "integrity": "sha512-v3eSDx/bF25pzar6aEJrrdTXJduEBU3uSGXHslIdGIpJVP8tQQHV6x1ZfzbFQ/bLIomLSbR/2ZCfnaEGkWkiVQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "@types/chai": "^5.2.2",
        "@vitest/spy": "4.0.3",
        "@vitest/utils": "4.0.3",
        "chai": "^6.0.1",
        "tinyrainbow": "^3.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/mocker": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/mocker/-/mocker-4.0.3.tgz",
      "integrity": "sha512-evZcRspIPbbiJEe748zI2BRu94ThCBE+RkjCpVF8yoVYuTV7hMe+4wLF/7K86r8GwJHSmAPnPbZhpXWWrg1qbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/spy": "4.0.3",
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
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/pretty-format/-/pretty-format-4.0.3.tgz",
      "integrity": "sha512-N7gly/DRXzxa9w9sbDXwD9QNFYP2hw90LLLGDobPNwiWgyW95GMxsCt29/COIKKh3P7XJICR38PSDePenMBtsw==",
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
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/runner/-/runner-4.0.3.tgz",
      "integrity": "sha512-1/aK6fPM0lYXWyGKwop2Gbvz1plyTps/HDbIIJXYtJtspHjpXIeB3If07eWpVH4HW7Rmd3Rl+IS/+zEAXrRtXA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/utils": "4.0.3",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/snapshot": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/snapshot/-/snapshot-4.0.3.tgz",
      "integrity": "sha512-amnYmvZ5MTjNCP1HZmdeczAPLRD6iOm9+2nMRUGxbe/6sQ0Ymur0NnR9LIrWS8JA3wKE71X25D6ya/3LN9YytA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.0.3",
        "magic-string": "^0.30.19",
        "pathe": "^2.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/spy": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/spy/-/spy-4.0.3.tgz",
      "integrity": "sha512-82vVL8Cqz7rbXaNUl35V2G7xeNMAjBdNOVaHbrzznT9BmiCiPOzhf0FhU3eP41nP1bLDm/5wWKZqkG4nyU95DQ==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://opencollective.com/vitest"
      }
    },
    "node_modules/@vitest/utils": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/@vitest/utils/-/utils-4.0.3.tgz",
      "integrity": "sha512-qV6KJkq8W3piW6MDIbGOmn1xhvcW4DuA07alqaQ+vdx7YA49J85pnwnxigZVQFQw3tWnQNRKWwhz5wbP6iv/GQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/pretty-format": "4.0.3",
        "tinyrainbow": "^3.0.3"
      },
      "funding": {
        "url": "https://opencollective.com/vitest"
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
      "version": "0.25.11",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.11.tgz",
      "integrity": "sha512-KohQwyzrKTQmhXDW1PjCv3Tyspn9n5GcY2RTDqeORIdIJY8yKIF7sTSopFmn/wpMPW4rdPXI0UE5LJLuq3bx0Q==",
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
        "@esbuild/aix-ppc64": "0.25.11",
        "@esbuild/android-arm": "0.25.11",
        "@esbuild/android-arm64": "0.25.11",
        "@esbuild/android-x64": "0.25.11",
        "@esbuild/darwin-arm64": "0.25.11",
        "@esbuild/darwin-x64": "0.25.11",
        "@esbuild/freebsd-arm64": "0.25.11",
        "@esbuild/freebsd-x64": "0.25.11",
        "@esbuild/linux-arm": "0.25.11",
        "@esbuild/linux-arm64": "0.25.11",
        "@esbuild/linux-ia32": "0.25.11",
        "@esbuild/linux-loong64": "0.25.11",
        "@esbuild/linux-mips64el": "0.25.11",
        "@esbuild/linux-ppc64": "0.25.11",
        "@esbuild/linux-riscv64": "0.25.11",
        "@esbuild/linux-s390x": "0.25.11",
        "@esbuild/linux-x64": "0.25.11",
        "@esbuild/netbsd-arm64": "0.25.11",
        "@esbuild/netbsd-x64": "0.25.11",
        "@esbuild/openbsd-arm64": "0.25.11",
        "@esbuild/openbsd-x64": "0.25.11",
        "@esbuild/openharmony-arm64": "0.25.11",
        "@esbuild/sunos-x64": "0.25.11",
        "@esbuild/win32-arm64": "0.25.11",
        "@esbuild/win32-ia32": "0.25.11",
        "@esbuild/win32-x64": "0.25.11"
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
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
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
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
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
    "node_modules/querystringify": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/querystringify/-/querystringify-2.2.0.tgz",
      "integrity": "sha512-FIqgj2EUvTa7R50u0rGsyTftzjYmv/a3hO345bZNrqabNqjtgiDMgmo4mkUjd+nzU5oF3dClKqFIPUKybUyqoQ==",
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
    "node_modules/siginfo": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/siginfo/-/siginfo-2.0.0.tgz",
      "integrity": "sha512-ybx0WO1/8bSBLEWXZvEd7gMW3Sn3JFlW3TvX1nREbDLRNQNaeNN8WK0meBwPdAaOI7TtRRRJn/Es1zhrrCHu7g==",
      "dev": true,
      "license": "ISC"
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
    "node_modules/vitest": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/vitest/-/vitest-4.0.3.tgz",
      "integrity": "sha512-IUSop8jgaT7w0g1yOM/35qVtKjr/8Va4PrjzH1OUb0YH4c3OXB2lCZDkMAB6glA8T5w8S164oJGsbcmAecr4sA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@vitest/expect": "4.0.3",
        "@vitest/mocker": "4.0.3",
        "@vitest/pretty-format": "4.0.3",
        "@vitest/runner": "4.0.3",
        "@vitest/snapshot": "4.0.3",
        "@vitest/spy": "4.0.3",
        "@vitest/utils": "4.0.3",
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
        "@vitest/browser-playwright": "4.0.3",
        "@vitest/browser-preview": "4.0.3",
        "@vitest/browser-webdriverio": "4.0.3",
        "@vitest/ui": "4.0.3",
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
      // --- ⬇️ [추가된 부분] ⬇️ ---
      esbuild: {
        target: 'esnext', // 테스트 환경에서도 esnext 문법(예: #)을 사용하도록 설정
      },
      // --- ⬆️ [추가된 부분] ⬆️ ---
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

                    <div id="portfolioExchangeRateGroup" class="input-group" style="margin-top: 10px;">
                        <label for="portfolioExchangeRate">💱 환율 (1 USD = ? KRW):</label>
                        <input type="number" id="portfolioExchangeRate" placeholder="예: 1300" min="0.01" step="0.01" value="1300">
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

## `js/main.js`

```javascript
// js/main.js (수정 후)
// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { PortfolioController } from './controller.js';
import Chart from 'chart.js/auto'; // Chart.js import 추가

try {
    const state = new PortfolioState();
    // PortfolioView는 객체 리터럴이므로 new 키워드 없이 사용
    const view = PortfolioView;
    // --- ⬇️ 수정: new PortfolioController 생성만 수행 ⬇️ ---
    const app = new PortfolioController(state, view);
    // app.init(); // <-- 제거 (init 메소드 없음, initialize는 생성자에서 호출됨)
    // --- ⬆️ 수정 ⬆️ ---

    // Make Chart globally available or pass it where needed (e.g., to View)
    // If View needs Chart, consider passing it during initialization or directly
    // For simplicity, let's assume View can access the global Chart object for now
    // (A better approach might be dependency injection)

    console.log("Application setup complete.");

} catch (error) {
    console.error("애플리케이션 초기화 중 치명적인 오류 발생:", error);
    // 사용자에게 오류 메시지를 표시하는 UI 로직 추가 가능
    const bodyElement = document.body;
    if (bodyElement) {
        bodyElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
            <h1>애플리케이션 로딩 실패</h1>
            <p>오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.</p>
            <p>오류 메시지: ${error.message}</p>
        </div>`;
    }
}
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
 * @property {number} [manualAmount] - 간단 모드용 수동 입력 금액 (선택 사항)
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
// js/calculator.js (Strategy Pattern Applied)
// @ts-check
import Decimal from 'decimal.js'; 
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

export class Calculator { 
    /** @type {CalculatorCache | null} */
    static #cache = null; 

    /**
     * @description 단일 주식의 매입 단가, 현재 가치, 손익 등을 계산합니다.
     * @param {Stock} stock - 계산할 주식 객체
     * @returns {CalculatedStock['calculated']} 계산 결과 객체
     */
    static calculateStockMetrics(stock) { 
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---
        try {
            const result = {
                totalBuyQuantity: new Decimal(0),
                totalSellQuantity: new Decimal(0),
                quantity: new Decimal(0),
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
                // [수정] state.js에서 이미 Decimal 객체로 변환했을 수 있으나,
                // calculateStockMetrics는 순수 함수이므로 number도 처리
                const txQuantity = new Decimal(tx.quantity || 0);
                const txPrice = new Decimal(tx.price || 0);

                if (tx.type === 'buy') {
                    result.totalBuyQuantity = result.totalBuyQuantity.plus(txQuantity);
                    result.totalBuyAmount = result.totalBuyAmount.plus(txQuantity.times(txPrice));
                } else if (tx.type === 'sell') {
                    result.totalSellQuantity = result.totalSellQuantity.plus(txQuantity);
                }
            }

            // 2. 순 보유 수량
            result.quantity = Decimal.max(0, result.totalBuyQuantity.minus(result.totalSellQuantity)); 

            // 3. 평균 매입 단가 (totalBuyAmount / totalBuyQuantity)
            if (result.totalBuyQuantity.greaterThan(0)) {
                result.avgBuyPrice = result.totalBuyAmount.div(result.totalBuyQuantity);
            }

            // 4. 현재 가치 (quantity * currentPrice)
            result.currentAmount = result.quantity.times(currentPrice);

            // 5. 손익 계산 (currentAmount - (quantity * avgBuyPrice))
            const originalCostOfHolding = result.quantity.times(result.avgBuyPrice);
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
                totalBuyQuantity: new Decimal(0), totalSellQuantity: new Decimal(0), quantity: new Decimal(0),
                totalBuyAmount: new Decimal(0), currentAmount: new Decimal(0), currentAmountUSD: new Decimal(0), currentAmountKRW: new Decimal(0),
                avgBuyPrice: new Decimal(0), profitLoss: new Decimal(0), profitLossRate: new Decimal(0),
            };
        } finally {
            // --- ⬇️ Performance Monitoring ⬇️ ---
            const endTime = performance.now();
            console.log(`[Perf] calculateStockMetrics (${stock.name || stock.id}) took ${(endTime - startTime).toFixed(2)} ms`);
            // --- ⬆️ Performance Monitoring ⬆️ ---
        }
    }

    /**
     * @description 포트폴리오 상태를 계산하고 캐싱합니다.
     * @param {{ portfolioData: Stock[], exchangeRate: number, currentCurrency: 'krw' | 'usd' }} options - 포트폴리오 데이터 및 환율/통화
     * @returns {PortfolioCalculationResult}
     */
    static calculatePortfolioState({ portfolioData, exchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE, currentCurrency = 'krw' }) {
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---

        const cacheKey = _generatePortfolioKey(portfolioData);

        if (Calculator.#cache && Calculator.#cache.key === cacheKey) {
             // --- ⬇️ Performance Monitoring (Cache Hit) ⬇️ ---
            const endTime = performance.now();
            console.log(`[Perf] calculatePortfolioState (Cache Hit) took ${(endTime - startTime).toFixed(2)} ms`);
            // --- ⬆️ Performance Monitoring ⬆️ ---
            return Calculator.#cache.result;
        }

        const exchangeRateDec = new Decimal(exchangeRate);
        let currentTotal = new Decimal(0);

        /** @type {CalculatedStock[]} */
        const calculatedPortfolioData = portfolioData.map(stock => {
            const calculatedMetrics = Calculator.calculateStockMetrics(stock); // This will log its own performance

            // 현재가치를 KRW와 USD로 변환
            if (currentCurrency === 'krw') {
                calculatedMetrics.currentAmountKRW = calculatedMetrics.currentAmount;
                calculatedMetrics.currentAmountUSD = calculatedMetrics.currentAmount.div(exchangeRateDec);
            } else { // usd
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
        Calculator.#cache = { key: cacheKey, result: result }; 

        // --- ⬇️ Performance Monitoring (Cache Miss) ⬇️ ---
        const endTime = performance.now();
        console.log(`[Perf] calculatePortfolioState (Cache Miss) for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);
        // --- ⬆️ Performance Monitoring ⬆️ ---

        return result;
    }
    
    // ▼▼▼▼▼ [신규] 전략 실행기 ▼▼▼▼▼
    /**
     * @description '전략' 객체를 받아 리밸런싱 계산을 실행합니다.
     * @param {import('./calculationStrategies.js').IRebalanceStrategy} strategy - 실행할 계산 전략 (Add or Sell)
     * @returns {{ results: any[] }} 계산 결과
     */
    static calculateRebalancing(strategy) {
        // Calculator는 더 이상 'add'인지 'sell'인지 알 필요가 없습니다.
        // 단순히 전략의 calculate 메서드를 호출합니다.
        return strategy.calculate();
    }
    // ▲▲▲▲▲ [신규] ▲▲▲▲▲
    

    // ▼▼▼▼▼ [삭제] calculateAddRebalancing ▼▼▼▼▼
    /*
    static calculateAddRebalancing({ portfolioData, additionalInvestment }) { 
        // ... (이 로직은 AddRebalanceStrategy로 이동했습니다) ...
    }
    */
    // ▲▲▲▲▲ [삭제] ▲▲▲▲▲


    // ▼▼▼▼▼ [삭제] calculateSellRebalancing ▼▼▼▼▼
    /*
    static calculateSellRebalancing({ portfolioData }) { 
        // ... (이 로직은 SellRebalanceStrategy로 이동했습니다) ...
    }
    */
    // ▲▲▲▲▲ [삭제] ▲▲▲▲▲


    /**
     * @description 포트폴리오의 섹터별 금액 및 비율을 계산합니다.
     * @param {CalculatedStock[]} portfolioData - 계산된 주식 데이터
     * @returns {{ sector: string, amount: Decimal, percentage: Decimal }[]} 섹터 분석 결과
     */
    static calculateSectorAnalysis(portfolioData) { 
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const startTime = performance.now();
        // --- ⬆️ Performance Monitoring ⬆️ ---
        
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
        
        // --- ⬇️ Performance Monitoring ⬇️ ---
        const endTime = performance.now();
        console.log(`[Perf] calculateSectorAnalysis for ${portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);
        // --- ⬆️ Performance Monitoring ⬆️ ---
        
        return result;
    }

    /**
     * @description 포트폴리오 계산 캐시를 초기화합니다.
     */
    static clearPortfolioStateCache() { 
        Calculator.#cache = null; 
    }
}
```

---

## `js/constants.js`

```javascript
// 설정값들을 정의하는 상수 객체
export const CONFIG = {
    MIN_BUYABLE_AMOUNT: 1000, 
    DEFAULT_EXCHANGE_RATE: 1300, 
    RATIO_TOLERANCE: 0.01, 
    DARK_MODE_KEY: 'darkMode', // (LocalStorage에 유지)
    
    // ▼▼▼▼▼ [신규] IndexedDB 키 ▼▼▼▼▼
    IDB_META_KEY: 'portfolioMeta_v2',
    IDB_PORTFOLIOS_KEY: 'portfolioData_v2',
    // ▲▲▲▲▲ [신규] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] 마이그레이션을 위한 레거시 LocalStorage 키 ▼▼▼▼▼
    // (참고: LEGACY_LS_PORTFOLIOS_KEY는 state.js에서 savePortfolios가 저장하던 방식에 맞게 수정됨)
    LEGACY_LS_META_KEY: 'portfolioCalculatorMeta_v1', 
    LEGACY_LS_PORTFOLIOS_KEY: 'portfolioCalculatorData_v1_all',
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲
    
    DATA_VERSION: '2.0.0', // [신규] state.js가 참조하는 버전 키
    
    // DATA_PREFIX: 'portfolioCalculatorData_v1_', // (주석 처리 - 현재 state.js에서 미사용)
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
 * @param {string} currency - 통화 코드 ('krw', 'usd')
 * @returns {string} 포맷팅된 통화 문자열
 */
export function formatCurrency(amount, currency = 'krw') {
    try {
        let num;
        if (amount === null || amount === undefined) {
            num = 0;
        } else if (typeof amount === 'object' && 'toNumber' in amount) { // Check if it's Decimal-like
            num = amount.toNumber(); // This is synchronous
        } else {
            num = Number(amount);
            if (isNaN(num)) num = 0;
        }

        const options = {
            style: 'currency',
            currency: currency.toUpperCase(), // Intl.NumberFormat requires uppercase
        };

        if (currency.toLowerCase() === 'krw') {
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        } else { // usd and others
            options.minimumFractionDigits = 2;
            options.maximumFractionDigits = 2;
        }
        return new Intl.NumberFormat(currency.toLowerCase() === 'usd' ? 'en-US' : 'ko-KR', options).format(num);
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
        const callNow = immediate && !timeoutId; // 즉시 실행 조건: immediate가 true이고 타이머가 없을 때
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

## `js/apiService.js`

```javascript
// @ts-check

/**
 * @description 단일 주식의 현재가를 Finnhub API(Vite 프록시 경유)에서 가져옵니다.
 * @param {string} ticker - 가져올 주식의 티커
 * @returns {Promise<number>} 현재가
 * @throws {Error} - API 호출 실패 또는 티커가 유효하지 않을 경우
 */
async function fetchStockPrice(ticker) {
    if (!ticker || ticker.trim() === '') {
        throw new Error('Ticker is empty.');
    }

    // Vite 프록시가 가로챌 주소 (/finnhub/quote)
    const url = `/finnhub/quote?symbol=${encodeURIComponent(ticker)}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!response.ok) {
        let errorBody = '';
        try {
            const errorData = await response.json();
            // Finnhub가 200 OK와 함께 에러 메시지를 보낼 때 (예: "No data found")
            if (errorData.c === 0 && errorData.d === null) {
                throw new Error(`Invalid ticker or no data found for ${ticker}`);
            }
            errorBody = errorData.error || await response.text();
        } catch (e) {
            // response.json() 자체가 실패할 때 (예: 404, 500)
            errorBody = (e instanceof Error) ? e.message : await response.text();
        }
        throw new Error(`API returned status ${response.status} for ${ticker}. ${errorBody}`);
    }

    const data = await response.json();
    const price = data.c; // Finnhub API의 'current price' 필드

    if (typeof price !== 'number' || price <= 0) {
        console.warn(`[API] Received invalid price for ${ticker}: ${price}`);
        throw new Error(`Invalid or zero price received for ${ticker}: ${price}`);
    }

    return price;
}

// 여러 종목의 가격을 병렬로 가져옵니다.
/**
 * @param {{id: string, ticker: string}[]} tickersToFetch 
 * @returns {Promise<{id: string, ticker: string, status: 'fulfilled' | 'rejected', value?: number, reason?: string}[]>}
 */
async function fetchAllStockPrices(tickersToFetch) {
    const results = await Promise.allSettled(
        tickersToFetch.map(async (item) => {
            const price = await fetchStockPrice(item.ticker);
            return { ...item, price }; // 성공 시 price 포함
        })
    );

    // Promise.allSettled 결과를 일관된 형식으로 매핑
    return results.map((result, index) => {
        const { id, ticker } = tickersToFetch[index];
        if (result.status === 'fulfilled') {
            return {
                id: result.value.id,
                ticker: result.value.ticker,
                status: 'fulfilled',
                value: result.value.price
            };
        } else {
            return {
                id: id,
                ticker: ticker,
                status: 'rejected',
                reason: (result.reason instanceof Error) ? result.reason.message : String(result.reason)
            };
        }
    });
}

export const apiService = {
    fetchStockPrice,
    fetchAllStockPrices
};
```

---

## `js/calculationStrategies.js`

```javascript
// js/calculationStrategies.js (버그 수정)
// @ts-check
import Decimal from 'decimal.js';

/**
 * @typedef {import('./types.js').CalculatedStock} CalculatedStock
 * @typedef {import('decimal.js').Decimal} Decimal
 */

/**
 * @description 모든 리밸런싱 전략이 따라야 하는 인터페이스(개념)
 * @interface
 */
class IRebalanceStrategy {
    /**
     * @returns {{results: any[]}} 계산 결과
     */
    calculate() {
        throw new Error("calculate() must be implemented by subclass.");
    }
}

/**
 * @description '추가 매수' 모드 계산 전략
 * @implements {IRebalanceStrategy}
 */
export class AddRebalanceStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;
    /** @type {Decimal} */
    #additionalInvestment;

    /**
     * @param {CalculatedStock[]} portfolioData
     * @param {Decimal} additionalInvestment
     */
    constructor(portfolioData, additionalInvestment) {
        super();
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate() {
        const startTime = performance.now();
        
        const totalInvestment = this.#portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0)).plus(this.#additionalInvestment);
        const results = [];
        
        // ▼▼▼ [수정] totalRatio 계산 시 .plus 및 new Decimal(0) 사용 ▼▼▼
        let totalRatio = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.targetRatio || 0), 
            new Decimal(0)
        );
        // ▲▲▲ [수정] ▲▲▲
        
        let totalFixedBuy = new Decimal(0);
        for (const s of this.#portfolioData) {
            // (참고: s.targetRatio는 이미 Decimal 객체)
            if (s.isFixedBuyEnabled) {
                totalFixedBuy = totalFixedBuy.plus(s.fixedBuyAmount || 0);
            }
        }
        
        let remainingInvestment = this.#additionalInvestment;
        const zero = new Decimal(0);
        
        for (const s of this.#portfolioData) {
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
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatio = totalInvestment.isZero() ? zero : currentAmount.div(totalInvestment).times(100);
            results.push({ ...s, currentRatio: currentRatio, finalBuyAmount: buyAmount, buyRatio: zero });
        }
        
        const ratioMultiplier = totalRatio.isZero() ? zero : new Decimal(100).div(totalRatio);
        const targetAmounts = results.map(s => {
            // ▼▼▼ [수정] s.targetRatio를 Decimal로 변환 ▼▼▼
            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            // ▲▲▲ [수정] ▲▲▲
            return {
                id: s.id,
                targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
                currentAmount: s.calculated?.currentAmount || zero,
                adjustmentAmount: zero
            };
        });
        
        const adjustmentTargets = targetAmounts.map(t => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(results.find(s => s.id === t.id)?.finalBuyAmount || zero);
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return { ...t, deficit: deficit.greaterThan(zero) ? deficit : zero };
        }).filter(t => t.deficit.greaterThan(zero));

        const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);
        
        if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
            for (const target of adjustmentTargets) {
                const ratio = target.deficit.div(totalDeficit);
                const allocatedAmount = remainingInvestment.times(ratio);
                const resultItem = results.find(r => r.id === target.id);
                if (resultItem) {
                    resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
                }
            }
        }

        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map(s => ({
            ...s,
            buyRatio: totalBuyAmount.isZero() ? zero : s.finalBuyAmount.div(totalBuyAmount).times(100),
        }));
        
        const endTime = performance.now();
        console.log(`[Perf] AddRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results: finalResults };
    }
}

/**
 * @description '간단 계산' 모드 전략 - 목표 비율에 맞춰 추가 투자금 배분 (거래 내역 없이 금액만 입력)
 * @implements {IRebalanceStrategy}
 */
export class SimpleRatioStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;
    /** @type {Decimal} */
    #additionalInvestment;

    /**
     * @param {CalculatedStock[]} portfolioData
     * @param {Decimal} additionalInvestment
     */
    constructor(portfolioData, additionalInvestment) {
        super();
        this.#portfolioData = portfolioData;
        this.#additionalInvestment = additionalInvestment;
    }

    calculate() {
        const startTime = performance.now();

        const zero = new Decimal(0);

        // 간단 모드에서는 manualAmount를 사용 (거래 내역 대신 직접 입력한 금액)
        const currentTotal = this.#portfolioData.reduce(
            (sum, s) => {
                const amount = s.manualAmount != null
                    ? new Decimal(s.manualAmount)
                    : (s.calculated?.currentAmount || zero);
                return sum.plus(amount);
            },
            zero
        );

        const totalInvestment = currentTotal.plus(this.#additionalInvestment);

        // 포트폴리오가 비어있으면 계산 불가
        if (totalInvestment.isZero()) {
            const endTime = performance.now();
            console.log(`[Perf] SimpleRatioStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`);
            return { results: [] };
        }

        // 목표 비율 합계 계산
        let totalRatio = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.targetRatio || 0),
            zero
        );

        // ===== 1단계: 고정 매수 금액 먼저 할당 =====
        let remainingInvestment = this.#additionalInvestment;
        const results = [];

        for (const s of this.#portfolioData) {
            const currentAmount = s.manualAmount != null
                ? new Decimal(s.manualAmount)
                : (s.calculated?.currentAmount || zero);

            let buyAmount = zero;

            // 고정 매수가 활성화되어 있으면 먼저 할당
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

            const currentRatio = currentTotal.isZero() ? zero : currentAmount.div(currentTotal).times(100);

            results.push({
                ...s,
                currentRatio: currentRatio,
                finalBuyAmount: buyAmount,
                buyRatio: zero,
                calculated: {
                    ...s.calculated,
                    currentAmount: currentAmount
                }
            });
        }

        // ===== 2단계: 남은 투자금을 목표 비율 deficit에 따라 배분 =====
        const ratioMultiplier = totalRatio.isZero() ? zero : new Decimal(100).div(totalRatio);

        const targetAmounts = results.map(s => {
            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            const currentAmount = s.calculated?.currentAmount || zero;
            return {
                id: s.id,
                targetAmount: totalInvestment.times(targetRatioNormalized.div(100)),
                currentAmount: currentAmount,
                adjustmentAmount: zero
            };
        });

        const adjustmentTargets = targetAmounts.map(t => {
            const currentTotalBeforeRatioAlloc = t.currentAmount.plus(results.find(s => s.id === t.id)?.finalBuyAmount || zero);
            const deficit = t.targetAmount.minus(currentTotalBeforeRatioAlloc);
            return { ...t, deficit: deficit.greaterThan(zero) ? deficit : zero };
        }).filter(t => t.deficit.greaterThan(zero));

        const totalDeficit = adjustmentTargets.reduce((sum, t) => sum.plus(t.deficit), zero);

        if (remainingInvestment.greaterThan(zero) && totalDeficit.greaterThan(zero)) {
            for (const target of adjustmentTargets) {
                const ratio = target.deficit.div(totalDeficit);
                const allocatedAmount = remainingInvestment.times(ratio);
                const resultItem = results.find(r => r.id === target.id);
                if (resultItem) {
                    resultItem.finalBuyAmount = resultItem.finalBuyAmount.plus(allocatedAmount);
                }
            }
        }

        // buyRatio 계산
        const totalBuyAmount = results.reduce((sum, s) => sum.plus(s.finalBuyAmount), zero);
        const finalResults = results.map(s => ({
            ...s,
            buyRatio: totalBuyAmount.isZero() ? zero : s.finalBuyAmount.div(totalBuyAmount).times(100),
        }));

        const endTime = performance.now();
        console.log(`[Perf] SimpleRatioStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results: finalResults };
    }
}

/**
 * @description '매도 리밸런싱' 모드 계산 전략
 * @implements {IRebalanceStrategy}
 */
export class SellRebalanceStrategy extends IRebalanceStrategy {
    /** @type {CalculatedStock[]} */
    #portfolioData;

    /**
     * @param {CalculatedStock[]} portfolioData
     */
    constructor(portfolioData) {
        super();
        this.#portfolioData = portfolioData;
    }

    calculate() {
        const startTime = performance.now();

        const currentTotal = this.#portfolioData.reduce((sum, s) => sum.plus(s.calculated?.currentAmount || new Decimal(0)), new Decimal(0));

        // ▼▼▼ [수정] totalRatio가 Decimal을 .plus()로 합산하도록 변경 ▼▼▼
        const totalRatio = this.#portfolioData.reduce(
            (sum, s) => sum.plus(s.targetRatio || 0),
            new Decimal(0)
        );
        // ▲▲▲ [수정] ▲▲▲

        const results = [];
        const zero = new Decimal(0);

        if (currentTotal.isZero() || totalRatio.isZero()) { // .isZero() 사용
            const endTime = performance.now();
            console.log(`[Perf] SellRebalanceStrategy (Aborted: Zero total) took ${(endTime - startTime).toFixed(2)} ms`);
            return { results: [] };
        }

        // ▼▼▼ [수정] totalRatio가 이미 Decimal이므로 new Decimal() 제거 ▼▼▼
        const ratioMultiplier = new Decimal(100).div(totalRatio);
        // ▲▲▲ [수정] ▲▲▲

        for (const s of this.#portfolioData) {
            const currentAmount = s.calculated?.currentAmount || zero;
            const currentRatioDec = currentAmount.div(currentTotal).times(100);
            const currentRatio = currentRatioDec.toNumber();

            // ▼▼▼ [수정] s.targetRatio를 Decimal로 변환 ▼▼▼
            const targetRatioNormalized = new Decimal(s.targetRatio || 0).times(ratioMultiplier);
            // ▲▲▲ [수정] ▲▲▲

            const targetAmount = currentTotal.times(targetRatioNormalized.div(100));
            const adjustment = currentAmount.minus(targetAmount);

            results.push({
                ...s,
                currentRatio: currentRatio,
                targetRatioNum: targetRatioNormalized.toNumber(),
                adjustment: adjustment
            });
        }

        const endTime = performance.now();
        console.log(`[Perf] SellRebalanceStrategy for ${this.#portfolioData.length} stocks took ${(endTime - startTime).toFixed(2)} ms`);

        return { results };
    }
}
```

---

## `js/testUtils.js`

```javascript
// js/testUtils.js
// @ts-check
import Decimal from 'decimal.js';

/**
 * @description 테스트용으로 완벽하게 계산된 CalculatedStock 객체를 생성합니다.
 * @param {string} id
 * @param {string} name
 * @param {string} ticker
 * @param {number} targetRatio - 목표 비율 (%)
 * @param {number} currentPrice - 현재가
 * @param {number} quantity - 보유 수량
 * @param {number} avgBuyPrice - 평단가
 * @returns {import('./types.js').CalculatedStock}
 */
export function createMockCalculatedStock({
    id, name, ticker, targetRatio, currentPrice, quantity, avgBuyPrice
}) {
    const currentAmount = new Decimal(currentPrice).times(quantity);
    const totalBuyAmount = new Decimal(avgBuyPrice).times(quantity);
    const profitLoss = currentAmount.minus(totalBuyAmount);
    const profitLossRate = totalBuyAmount.isZero() ? new Decimal(0) : profitLoss.div(totalBuyAmount).times(100);

    return {
        id: id,
        name: name,
        ticker: ticker,
        sector: 'Test Sector',
        targetRatio: new Decimal(targetRatio),
        currentPrice: new Decimal(currentPrice),
        isFixedBuyEnabled: false,
        fixedBuyAmount: new Decimal(0),
        transactions: [], // 테스트 편의를 위해 transactions는 비워둠
        calculated: {
            quantity: new Decimal(quantity),
            avgBuyPrice: new Decimal(avgBuyPrice),
            currentAmount: currentAmount,
            profitLoss: profitLoss,
            profitLossRate: profitLossRate,
            totalBuyQuantity: new Decimal(quantity),
            totalSellQuantity: new Decimal(0),
            totalBuyAmount: totalBuyAmount,
            currentAmountUSD: new Decimal(0),
            currentAmountKRW: new Decimal(0),
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

export const MOCK_PORTFOLIO_1 = {
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
 * @param {string} currency - 현재 통화 ('krw' or 'usd')
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
 * @description '간단 계산' 모드의 계산 결과를 표시할 HTML 문자열을 생성합니다.
 * @param {(CalculatedStock & { currentRatio: Decimal, finalBuyAmount: Decimal, buyRatio: Decimal })[]} results - 계산 결과 배열
 * @param {{ currentTotal: Decimal, additionalInvestment: Decimal, finalTotal: Decimal }} summary - 요약 정보 객체
 * @param {string} currency - 현재 통화 ('krw' or 'usd')
 * @returns {string} 생성된 HTML 문자열
 */
export function generateSimpleModeResultsHTML(results, summary, currency) {
    if (!results) return '';

    const sortedResults = [...results].sort((a, b) => {
        const ratioA = a.currentRatio ?? new Decimal(0);
        const ratioB = b.currentRatio ?? new Decimal(0);
        return ratioB.comparedTo(ratioA);
    });

    const resultsRows = sortedResults.map((stock, index) => {
        const metrics = stock.calculated ?? { currentAmount: new Decimal(0) };
        const currentAmount = metrics.currentAmount instanceof Decimal ? metrics.currentAmount : new Decimal(metrics.currentAmount ?? 0);

        const currentRatioVal = stock.currentRatio?.isFinite() ? stock.currentRatio.toFixed(1) : '0.0';
        const targetRatioVal = typeof stock.targetRatio === 'number' ? stock.targetRatio.toFixed(1) : (stock.targetRatio?.toFixed(1) ?? '0.0');
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
    }).join('');

    const buyableStocks = sortedResults.filter(s =>
        s.finalBuyAmount && s.finalBuyAmount.greaterThan(CONFIG.MIN_BUYABLE_AMOUNT)
    );

    const guideContent = buyableStocks.length > 0
        ? buyableStocks.map((s, i) => {
            const currentRatioVal = s.currentRatio?.isFinite() ? s.currentRatio.toFixed(1) : '0.0';
            return `
                <div class="guide-item">
                    <div><strong>${i + 1}. ${escapeHTML(s.ticker)}</strong> (${escapeHTML(s.name)}): ${formatCurrency(s.finalBuyAmount, currency)}</div>
                    <span style="font-weight: bold; color: #666;">(현재 비율: ${currentRatioVal}%)</span>
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
 * @param {(CalculatedStock & { currentRatio: number, targetRatioNum: number, adjustment: Decimal })[]} results - 계산 결과 배열
 * @param {string} currency - 현재 통화 ('krw' or 'usd')
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
                        ${adjustmentVal.isPositive() ? t('ui.sellWithIcon') : t('ui.buyWithIcon')}: ${formatCurrency(adjustmentVal.abs(), currency)}
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
 * @param {string} currency - 현재 통화 ('krw' or 'usd')
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

## `js/validator.js`

```javascript
// js/validator.js
// @ts-check
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').ValidationResult} ValidationResult */
/** @typedef {import('./types.js').ValidationErrorDetail} ValidationErrorDetail */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

export const Validator = {
    /**
     * @description 숫자 입력값을 검증하고, 유효하면 숫자 타입으로 변환하여 반환합니다.
     * @param {string | number | null | undefined} value - 검증할 값
     * @returns {{isValid: boolean, value?: number, message?: string}} 검증 결과
     */
    validateNumericInput(value) {
        // --- ⬇️ 재수정: 빈 문자열, null, undefined 체크 강화 ⬇️ ---
        const trimmedValue = String(value ?? '').trim(); // null/undefined를 빈 문자열로 처리 후 trim
        if (trimmedValue === '') {
             return { isValid: false, message: t('validation.invalidNumber') };
        }
        // --- ⬆️ 재수정 ⬆️ ---

        const num = Number(trimmedValue); // Use trimmed value for conversion
        if (isNaN(num)) {
            return { isValid: false, message: t('validation.invalidNumber') };
        }
        if (num < 0) {
            return { isValid: false, message: t('validation.negativeNumber') };
        }
        // Check for excessively large numbers or precision issues using Decimal.js
        try {
            const decValue = new Decimal(trimmedValue); // Use trimmed value
            if (!decValue.isFinite()) {
                 throw new Error('Number is not finite');
            }
            if (!isFinite(num)){ // Check standard JS finiteness too
                 throw new Error('Number is too large for standard JS number');
            }
        } catch (e) {
             console.error("Decimal validation error:", e);
             return { isValid: false, message: t('validation.calcErrorDecimal') };
        }

        return { isValid: true, value: num };
    },

    // ... (validateTransaction 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 단일 거래 내역의 유효성을 검사합니다.
     * @param {Partial<Transaction>} txData - 거래 데이터
     * @returns {ValidationResult} 검증 결과
     */
    validateTransaction(txData) {
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
            if (Number(txData.quantity) === 0) return { isValid: false, message: t('validation.quantityZero')};
            // --- ⬇️ 수정: 음수 메시지 반환 로직 추가 ---
            if (Number(txData.quantity) < 0) return { isValid: false, message: t('validation.negativeNumber') };
            // --- ⬆️ 수정 ---
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
            if (Number(txData.price) === 0) return { isValid: false, message: t('validation.priceZero')};
            // --- ⬇️ 수정: 음수 메시지 반환 로직 추가 ---
            if (Number(txData.price) < 0) return { isValid: false, message: t('validation.negativeNumber') };
            // --- ⬆️ 수정 ---
            return { isValid: false, message: priceValidation.message }; // Should be invalidNumber here
        }
         // validateNumericInput already checks for < 0, but explicit 0 check remains useful
        if (priceValidation.value === 0) {
             return { isValid: false, message: t('validation.priceZero') };
        }


        return { isValid: true };
    },

    // ... (validateForCalculation 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 리밸런싱 계산 전 전체 입력 데이터의 유효성을 검사합니다.
     * @param {{mainMode: 'add' | 'sell' | 'simple', portfolioData: CalculatedStock[], additionalInvestment: Decimal}} inputs - 계산 입력값
     * @returns {ValidationErrorDetail[]} 오류 배열 (유효하면 빈 배열)
     */
    validateForCalculation(inputs) {
        /** @type {ValidationErrorDetail[]} */
        const errors = [];
        const { mainMode, portfolioData, additionalInvestment } = inputs;

        // 추가 매수 모드 또는 간단 계산 모드일 때 추가 투자금액 검증
        if (mainMode === 'add' || mainMode === 'simple') {
             // Use Decimal's comparison methods
             if (!additionalInvestment || additionalInvestment.isNaN() || additionalInvestment.isNegative() || additionalInvestment.isZero()) {
                 errors.push({ field: 'additionalInvestment', stockId: null, message: t('validation.investmentAmountZero') });
             }
        }

        let totalFixedBuyAmount = new Decimal(0);

        // 각 주식 항목 검증
        portfolioData.forEach(stock => {
            const stockName = stock.name || t('defaults.newStock'); // Use default if name is empty

            if (!stock.name?.trim()) {
                errors.push({ field: 'name', stockId: stock.id, message: t('validation.nameMissing') });
            }
            if (!stock.ticker?.trim()) {
                errors.push({ field: 'ticker', stockId: stock.id, message: t('validation.tickerMissing', { name: stockName }) });
            }

            // --- ⬇️ 수정: stock.calculated 및 quantity 존재 여부 더 안전하게 확인 ⬇️ ---
            const quantity = stock.calculated?.quantity;
            const currentPrice = new Decimal(stock.currentPrice ?? 0); // Use Decimal for currentPrice check

            if (quantity && quantity instanceof Decimal && quantity.greaterThan(0) && (currentPrice.isNaN() || currentPrice.isNegative() || currentPrice.isZero())) {
                 errors.push({ field: 'currentPrice', stockId: stock.id, message: t('validation.currentPriceZero', { name: stockName }) });
             }
             // --- ⬆️ 수정 ⬆️ ---


            // 고정 매수 관련 검증 (추가 매수 모드 및 간단 계산 모드에서)
            if ((mainMode === 'add' || mainMode === 'simple') && stock.isFixedBuyEnabled) {
                const fixedAmount = new Decimal(stock.fixedBuyAmount || 0);
                // currentPrice는 위에서 Decimal로 변환됨

                if (fixedAmount.isNaN() || fixedAmount.isNegative() || fixedAmount.isZero()) {
                     errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountZero', { name: stockName }) });
                } else if (!currentPrice.isNaN() && currentPrice.greaterThan(0) && fixedAmount.lessThan(currentPrice)) {
                     // 고정 매수 금액이 현재가보다 작아 1주도 살 수 없는 경우
                     errors.push({ field: 'fixedBuyAmount', stockId: stock.id, message: t('validation.fixedBuyAmountTooSmall', { name: stockName }) });
                }
                totalFixedBuyAmount = totalFixedBuyAmount.plus(fixedAmount);
            }

            // 목표 비율 검증 (음수 여부 등)
            const targetRatio = new Decimal(stock.targetRatio ?? 0); // Use ?? 0 for safety
             if (targetRatio.isNaN() || targetRatio.isNegative()) {
                 errors.push({ field: 'targetRatio', stockId: stock.id, message: t('validation.negativeNumber') }); // Can't be negative
             }
        });

         // 추가 매수 모드 및 간단 계산 모드에서 총 고정 매수 금액이 추가 투자금을 초과하는지 검증
         if ((mainMode === 'add' || mainMode === 'simple') && !additionalInvestment.isNaN() && totalFixedBuyAmount.greaterThan(additionalInvestment)) {
             errors.push({ field: 'fixedBuyAmount', stockId: null, message: t('validation.fixedBuyTotalExceeds') });
         }


        return errors;
    },

    // ... (isDataStructureValid 함수 - 이전과 동일하게 유지) ...
    /**
     * @description 가져온(import) 데이터의 기본 구조가 유효한지 검사합니다.
     * @param {any} data - JSON.parse로 읽어온 데이터
     * @returns {boolean} 구조 유효 여부
     */
    isDataStructureValid(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.meta || typeof data.meta !== 'object' || typeof data.meta.activePortfolioId !== 'string') return false; // Check type
        if (!data.portfolios || typeof data.portfolios !== 'object') return false;

        // Check individual portfolios
        for (const portId in data.portfolios) {
            const portfolio = data.portfolios[portId];
            if (!portfolio || typeof portfolio !== 'object') return false;
            if (portfolio.id !== portId || !portfolio.name || typeof portfolio.name !== 'string') return false;
            // Check settings object structure (basic)
            if (!portfolio.settings || typeof portfolio.settings !== 'object') return false;
            if (!['add', 'sell', 'simple'].includes(portfolio.settings.mainMode)) return false;
            if (!['krw', 'usd'].includes(portfolio.settings.currentCurrency)) return false;
            if (typeof portfolio.settings.exchangeRate !== 'number' || portfolio.settings.exchangeRate <= 0) return false;

            // Check portfolioData array structure (basic)
            if (!Array.isArray(portfolio.portfolioData)) return false;
            // Optionally, add checks for individual stock structure within portfolioData if needed
             for (const stock of portfolio.portfolioData) {
                 if (!stock || typeof stock !== 'object' || !stock.id || typeof stock.id !== 'string') return false;
                 // Add more checks for required stock properties (name, ticker, etc.)
                 if (typeof stock.name !== 'string' || typeof stock.ticker !== 'string') return false;
                 // Allow optional sector
                 if (stock.sector !== undefined && typeof stock.sector !== 'string') return false;
                 if (typeof stock.targetRatio !== 'number' || stock.targetRatio < 0) return false;
                 if (typeof stock.currentPrice !== 'number' || stock.currentPrice < 0) return false;
                 // Allow missing optional fields if they have defaults upon loading/calculation
                 if (stock.isFixedBuyEnabled !== undefined && typeof stock.isFixedBuyEnabled !== 'boolean') return false;
                 if (stock.fixedBuyAmount !== undefined && (typeof stock.fixedBuyAmount !== 'number' || stock.fixedBuyAmount < 0)) return false;

                 if (!Array.isArray(stock.transactions)) return false;
                 // Check transaction structure if necessary
                 for (const tx of stock.transactions) {
                      if (!tx || typeof tx !== 'object' || !tx.id || typeof tx.id !== 'string') return false;
                      if (!['buy', 'sell'].includes(tx.type)) return false;
                      if (typeof tx.date !== 'string' || isNaN(new Date(tx.date).getTime())) return false;
                       // Allow quantity/price to be potentially stored as strings if parsed later
                      if ((typeof tx.quantity !== 'number' && typeof tx.quantity !== 'string') || Number(tx.quantity) <= 0) return false;
                      if ((typeof tx.price !== 'number' && typeof tx.price !== 'string') || Number(tx.price) <= 0) return false;
                 }
             }
        }

        return true;
    }
};
```

---

## `js/state.js`

```javascript
// js/state.js (IndexedDB + Async + DOMPurify)
// @ts-check
import { nanoid } from 'nanoid';
import Decimal from 'decimal.js';
import { CONFIG } from './constants.js';
import { t } from './i18n.js';
import { ErrorService } from './errorService.js';
import { Validator } from './validator.js';
import { get, set, del } from 'idb-keyval';
import DOMPurify from 'dompurify'; // ▼▼▼ [신규] DOMPurify 임포트 ▼▼▼

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').Transaction} Transaction */
/** @typedef {import('./types.js').Portfolio} Portfolio */
/** @typedef {import('./types.js').PortfolioSettings} PortfolioSettings */
/** @typedef {import('./types.js').MetaState} MetaState */

export class PortfolioState {
    /** @type {Record<string, Portfolio>} */
    #portfolios = {};
    /** @type {string | null} */
    #activePortfolioId = null;
    /** @type {Promise<void> | null} */
    #initializationPromise = null;

    constructor() {
        this.#initializationPromise = this._initialize();
    }

    /**
     * @description public async 메서드로 변경
     */
    async ensureInitialized() {
        await this.#initializationPromise;
    }

    /**
     * @description 비동기 초기화 및 LocalStorage 마이그레이션 로직
     */
    async _initialize() {
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
     * @description LocalStorage -> IndexedDB 마이그레이션
     * @returns {Promise<boolean>} 마이그레이션 성공 여부
     */
    async _migrateFromLocalStorage() {
        try {
            const lsMeta = localStorage.getItem(CONFIG.LEGACY_LS_META_KEY); 
            const lsPortfolios = localStorage.getItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY); 

            if (lsMeta && lsPortfolios) {
                const metaData = JSON.parse(lsMeta);
                const portfolioData = JSON.parse(lsPortfolios);

                // 1. 새 IDB 키로 데이터 쓰기
                await set(CONFIG.IDB_META_KEY, metaData);
                await set(CONFIG.IDB_PORTFOLIOS_KEY, portfolioData);

                // 2. 마이그레이션 성공 후 레거시 LocalStorage 데이터 삭제
                localStorage.removeItem(CONFIG.LEGACY_LS_META_KEY);
                localStorage.removeItem(CONFIG.LEGACY_LS_PORTFOLIOS_KEY);
                
                console.log("Successfully migrated data from LocalStorage to IndexedDB.");
                return true;
            }
            console.log("No legacy data found in LocalStorage to migrate.");
            return false;
        } catch (error) {
            console.error("Failed to migrate from LocalStorage:", error);
            return false;
        }
    }

    /**
     * @description IDB에서 Meta 로드 (async)
     */
    async _loadMeta() {
        try {
            const metaData = await get(CONFIG.IDB_META_KEY);
            return metaData ? metaData : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadMeta - IDB get');
            return null;
        }
    }

    /**
     * @description IDB에서 Portfolios 로드 (async)
     */
    async _loadPortfolios() {
        try {
            const portfolioData = await get(CONFIG.IDB_PORTFOLIOS_KEY); 
            return portfolioData ? portfolioData : null;
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), '_loadPortfolios - IDB get');
            return null;
        }
    }

     _validateAndUpgradeData(loadedMetaData, loadedPortfolios) {
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
                                id: stock.id || `s-${nanoid()}`,
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
                                        id: tx.id || `tx-${nanoid()}`,
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


    getActivePortfolio() {
        return this.#activePortfolioId ? this.#portfolios[this.#activePortfolioId] : null;
    }

    getAllPortfolios() {
        return this.#portfolios;
    }

    async setActivePortfolioId(id) {
        if (this.#portfolios[id]) {
            this.#activePortfolioId = id;
            await this.saveMeta(); // 비동기 저장
        } else {
            ErrorService.handle(new Error(`Portfolio with ID ${id} not found.`), 'setActivePortfolioId');
        }
    }

    async createNewPortfolio(name) {
        const newId = `p-${nanoid()}`;
        const newPortfolio = this._createDefaultPortfolio(newId, name);
        this.#portfolios[newId] = newPortfolio;
        this.#activePortfolioId = newId;
        await this.savePortfolios(); // 비동기 저장
        await this.saveMeta(); // 비동기 저장
        return newPortfolio;
    }

    async deletePortfolio(id) {
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

    async renamePortfolio(id, newName) {
        if (this.#portfolios[id]) {
            this.#portfolios[id].name = newName.trim();
            await this.savePortfolios(); // 비동기 저장
        } else {
             ErrorService.handle(new Error(`Portfolio with ID ${id} not found for renaming.`), 'renamePortfolio');
        }
    }

    async updatePortfolioSettings(key, value) {
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


    async addNewStock() {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const newStock = this._createDefaultStock();
            activePortfolio.portfolioData.push(newStock);
            await this.saveActivePortfolio(); // 비동기 저장
            return newStock;
        }
        return null;
    }

    async deleteStock(stockId) {
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

    getStockById(stockId) {
        const activePortfolio = this.getActivePortfolio();
        return activePortfolio?.portfolioData.find(s => s.id === stockId);
    }

    updateStockProperty(stockId, field, value) {
        const activePortfolio = this.getActivePortfolio();
        if (activePortfolio) {
            const stockIndex = activePortfolio.portfolioData.findIndex(s => s.id === stockId);
            if (stockIndex > -1) {
                const stock = activePortfolio.portfolioData[stockIndex];
                 if (['targetRatio', 'currentPrice', 'fixedBuyAmount'].includes(field)) {
                     try {
                         const decimalValue = new Decimal(value ?? 0);
                         if (decimalValue.isNaN()) throw new Error('Invalid number for Decimal');
                          // @ts-ignore
                         stock[field] = decimalValue;
                     } catch (e) {
                         ErrorService.handle(new Error(`Invalid numeric value for ${field}: ${value}`), 'updateStockProperty');
                          // @ts-ignore
                         stock[field] = new Decimal(0);
                     }
                 } else if (field === 'isFixedBuyEnabled') {
                      // @ts-ignore
                     stock[field] = Boolean(value);
                 } else if (typeof stock[field] !== 'undefined') {
                      // @ts-ignore
                     stock[field] = value;
                 } else {
                      console.warn(`Attempted to update non-existent property '${field}' on stock ${stockId}`);
                 }
            }
        }
    }

    async addTransaction(stockId, transactionData) {
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
                    id: `tx-${nanoid()}`,
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

    async deleteTransaction(stockId, transactionId) {
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


    getTransactions(stockId) {
        const stock = this.getStockById(stockId);
        const transactions = stock ? [...stock.transactions] : []; // Return a copy
        return transactions;
    }

    normalizeRatios() {
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

    async resetData(save = true) {
        const defaultPortfolio = this._createDefaultPortfolio(`p-${nanoid()}`);
        this.#portfolios = { [defaultPortfolio.id]: defaultPortfolio };
        this.#activePortfolioId = defaultPortfolio.id;
        if (save) {
            await this.savePortfolios(); // 비동기 저장
            await this.saveMeta(); // 비동기 저장
        }
        console.log("Data reset to default.");
    }

    exportData() {
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

    async importData(importedData) {
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


    async saveMeta() {
        try {
            const metaData = { activePortfolioId: this.#activePortfolioId, version: CONFIG.DATA_VERSION };
            await set(CONFIG.IDB_META_KEY, metaData); 
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'saveMeta - IDB set');
        }
    }

    async savePortfolios() {
        try {
             const saveablePortfolios = {};
             Object.entries(this.#portfolios).forEach(([id, portfolio]) => {
                 saveablePortfolios[id] = {
                     ...portfolio,
                     portfolioData: portfolio.portfolioData.map(stock => {
                        // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
                        // 'calculated' 속성을 분해해서 저장 대상에서 제외
                        const { calculated, ...saveableStock } = stock;
                        // ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲

                         return {
                             // ▼▼▼ [수정] stock 대신 saveableStock 사용, Decimal 체크 추가
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
                             // ▲▲▲ [수정]
                         };
                     })
                 };
             });
            await set(CONFIG.IDB_PORTFOLIOS_KEY, saveablePortfolios); 
        } catch (error) {
             if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 ErrorService.handle(error, 'savePortfolios - Quota Exceeded');
             } else {
                 ErrorService.handle(/** @type {Error} */ (error), 'savePortfolios - IDB set');
             }
        }
    }

    async saveActivePortfolio() {
        await this.savePortfolios();
    }

    // --- Private Helper Methods ---

    _createDefaultPortfolio(id, name = t('defaults.defaultPortfolioName')) {
        return {
            id: id,
            name: name,
            settings: {
                mainMode: 'simple',
                currentCurrency: 'krw',
                exchangeRate: CONFIG.DEFAULT_EXCHANGE_RATE,
            },
            portfolioData: [this._createDefaultStock()]
        };
    }

    _createDefaultStock() {
        return {
            id: `s-${nanoid()}`,
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

## `js/state.test.js`

```javascript
// js/state.test.js (async / idb-keyval / testUtils / Assertion Fix)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PortfolioState } from './state.js';
import { CONFIG } from './constants.js'; 
import Decimal from 'decimal.js';
// ▼▼▼ [신규] testUtils 임포트 ▼▼▼
import { MOCK_PORTFOLIO_1 } from './testUtils.js'; // (MOCK_PORTFOLIO_1은 Decimal 객체를 포함)
// ▲▲▲ [신규] ▲▲▲

// --- ▼▼▼ [신규] idb-keyval 모의(Mock) ▼▼▼ ---
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));
// --- ▲▲▲ [신규] ▲▲▲ ---

// --- i18n 모의(Mock) ---
vi.mock('./i18n.js', () => ({
  t: vi.fn((key) => {
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
        sanitize: vi.fn((input) => input), // 소독 함수를 그대로 반환하도록 모의
    }
}));

// ▼▼▼▼▼ [추가된 부분] ▼▼▼▼▼
// ErrorService가 View에 의존하여 발생하는 순환 참조 오류를 방지하기 위해 모의 처리
vi.mock('./errorService.js', () => ({
  ErrorService: {
    handle: vi.fn(), // handle 함수를 모의
  },
  ValidationError: class extends Error {} // ValidationError 클래스도 모의
}));
// ▲▲▲▲▲ [추가된 부분] ▲▲▲▲▲


describe('PortfolioState (Async)', () => {
  let state;
  let mockGet;
  let mockSet;
  let mockDel;
  // ▼▼▼ [추가된 부분] ▼▼▼
  let mockErrorService; 
  // ▲▲▲ [추가된 부분] ▲▲▲

  beforeEach(async () => { 
    // 모의 함수 초기화
    vi.clearAllMocks();
    
    // ▼▼▼ [수정] idb-keyval 모의 함수 할당 ▼▼▼
    mockGet = vi.mocked(get);
    mockSet = vi.mocked(set);
    mockDel = vi.mocked(del);
    // mockErrorService = vi.mocked(ErrorService); // ErrorService는 임포트하지 않으므로 이 줄은 필요 없음
    
    // 기본적으로 비어있는 DB 시뮬레이션
    mockGet.mockResolvedValue(null); 
    // ▲▲▲ [수정] ▲▲▲

    // Create a new state instance for each test
    state = new PortfolioState();
    await state.ensureInitialized(); // Wait for initialization
  });

   afterEach(() => {
     // ...
   });

  it('should create default portfolio on initialization if none exists', async () => { 
    // ensureInitialized was called in beforeEach
    expect(Object.keys(state.getAllPortfolios()).length).toBe(1);
    const activePortfolio = state.getActivePortfolio();
    expect(activePortfolio?.id).toBeDefined();
    expect(activePortfolio?.name).toBe('기본 포트폴리오'); 
    expect(activePortfolio?.portfolioData?.length).toBe(1);
    expect(activePortfolio?.portfolioData?.[0]?.name).toBe('새 종목');
    
    // ▼▼▼ [수정] _initialize는 resetData(false)를 호출하므로, set은 호출되지 않아야 합니다. ▼▼▼
    // (resetData(true)가 호출될 때만 set이 호출됨)
    expect(mockSet).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲
  });

   it('should load existing data from IndexedDB on initialization', async () => {
     // ▼▼▼ [수정] testUtils에서 가져온 모의 데이터는 Decimal 객체를 포함하고 있음
     // _validateAndUpgradeData는 숫자형 원시값을 기대하므로, 테스트용 원시 데이터 생성
     const rawStockData = {
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
             settings: { mainMode: 'sell', currentCurrency: 'usd', exchangeRate: 1200 },
             portfolioData: [rawStockData] // 원시 데이터(number) 사용
            }
       }
     };
     // ▲▲▲ [수정] ▲▲▲
     
     // ▼▼▼ [수정] idb-keyval (get) 모의 설정 ▼▼▼
     mockGet.mockImplementation(async (key) => {
        if (key === CONFIG.IDB_META_KEY) return testData.meta;
        if (key === CONFIG.IDB_PORTFOLIOS_KEY) return testData.portfolios;
        return null;
     });
     // ▲▲▲ [수정] ▲▲▲

     const newState = new PortfolioState(); // Create new instance to test loading
     await newState.ensureInitialized(); // Initialize

     // ▼▼▼ [수정] Decimal 객체로 로드되었는지 확인 ▼▼▼
     expect(Object.keys(newState.getAllPortfolios()).length).toBe(1);
     const loadedPortfolio = newState.getActivePortfolio();
     
     expect(loadedPortfolio?.id).toBe('p-test');
     expect(loadedPortfolio?.name).toBe('Test Portfolio');
     expect(loadedPortfolio?.settings.mainMode).toBe('sell');
     expect(loadedPortfolio?.portfolioData?.[0]?.name).toBe('Test Stock');
     // state.js가 number를 Decimal 객체로 변환하는지 확인
     expect(loadedPortfolio?.portfolioData?.[0]?.targetRatio).toBeInstanceOf(Decimal);
     expect(loadedPortfolio?.portfolioData?.[0]?.targetRatio.toNumber()).toBe(100);
     // ▲▲▲ [수정] ▲▲▲
   });


   it('should add a new stock correctly (async)', async () => {
       const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
       
       // ▼▼▼ [수정] await 추가 ▼▼▼
       const newStock = await state.addNewStock(); 
       
       expect(state.getActivePortfolio()?.portfolioData?.length).toBe(initialLength + 1);
       expect(newStock.name).toBe('새 종목'); 
       expect(newStock.targetRatio).toBeInstanceOf(Decimal); // Decimal로 생성되었는지 확인
       expect(newStock.targetRatio.toNumber()).toBe(0);
       
       // saveActivePortfolio -> savePortfolios -> set 호출 확인
       expect(mockSet).toHaveBeenCalledWith(CONFIG.IDB_PORTFOLIOS_KEY, expect.any(Object));
       // ▲▲▲ [수정] ▲▲▲
   });

    it('should not delete the last stock in a portfolio (async)', async () => {
        const portfolio = state.getActivePortfolio();
        expect(portfolio?.portfolioData?.length).toBe(1); 

        if (portfolio && portfolio.portfolioData.length === 1) {
            const stockId = portfolio.portfolioData[0].id;
            
            // ▼▼▼ [수정] await 추가 ▼▼▼
            const deleted = await state.deleteStock(stockId); 
            expect(deleted).toBe(false); // Expect deletion to fail
            expect(state.getActivePortfolio()?.portfolioData?.length).toBe(1);
            // ▲▲▲ [수정] ▲▲▲
        }
    });

    it('should delete a stock if there are multiple (async)', async () => {
        await state.addNewStock(); // Add a second stock (async)
        const initialLength = state.getActivePortfolio()?.portfolioData?.length || 0;
        expect(initialLength).toBeGreaterThan(1);

        const portfolioBeforeDelete = state.getActivePortfolio();
        if (portfolioBeforeDelete) {
            const stockIdToDelete = portfolioBeforeDelete.portfolioData[0].id; 
            
            // ▼▼▼ [수정] await 추가 ▼▼▼
            const deleted = await state.deleteStock(stockIdToDelete);
            expect(deleted).toBe(true); 
            
            const portfolioAfterDelete = state.getActivePortfolio();
            expect(portfolioAfterDelete?.portfolioData?.length).toBe(initialLength - 1); 
            expect(portfolioAfterDelete?.portfolioData?.find(s => s.id === stockIdToDelete)).toBeUndefined();
            // ▲▲▲ [수정] ▲▲▲
        } else {
             throw new Error("Failed to get active portfolio for deletion test");
        }
    });
});
```

---

## `js/i18n.js`

```javascript
// js/i18n.js (Updated with missing ui keys)
// @ts-check

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
 * @returns {'en' | 'ko'}
 */
function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.toLowerCase().startsWith('ko')) {
        return 'ko';
    }
    return 'en'; // 기본값
}

// 2. 현재 언어 설정
const currentLang = getBrowserLanguage();
const messages = locales[currentLang] || locales.en;


/**
 * 키와 대체값을 기반으로 메시지 문자열을 반환합니다.
 * @param {string} key - 점으로 구분된 메시지 키 (예: 'toast.dataReset')
 * @param {Record<string, string | number>} [replacements] - {name}, {totalRatio} 등을 대체할 값
 * @returns {string}
 */
export function t(key, replacements = {}) {
    const keys = key.split('.');
    let message = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, messages);

    if (typeof message !== 'string') {
        message = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, locales.en); // Fallback to English
        if (typeof message !== 'string') {
             console.warn(`[i18n] Missing key in all locales: ${key}`);
             return key;
        }
    }

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
// js/eventBinder.js (Updated with Pub/Sub emit)
// @ts-check
import { debounce } from './utils.js';
/** @typedef {import('./view.js').PortfolioView} PortfolioView */ // 컨트롤러 대신 View를 임포트

/**
 * @description 애플리케이션의 DOM 이벤트를 View의 추상 이벤트로 연결합니다.
 * @param {PortfolioView} view - PortfolioView 인스턴스
 * @returns {void}
 */
export function bindEventListeners(view) {
    // 1. view.dom 객체를 가져옵니다.
    const dom = view.dom;

    // ▼▼▼▼▼ [수정] controller.handle...() -> view.emit('eventName') ▼▼▼▼▼

    // 포트폴리오 관리 버튼
    dom.newPortfolioBtn?.addEventListener('click', () => view.emit('newPortfolioClicked'));
    dom.renamePortfolioBtn?.addEventListener('click', () => view.emit('renamePortfolioClicked'));
    dom.deletePortfolioBtn?.addEventListener('click', () => view.emit('deletePortfolioClicked'));
    dom.portfolioSelector?.addEventListener('change', (e) => 
        view.emit('portfolioSwitched', { newId: (/** @type {HTMLSelectElement} */ (e.target)).value })
    );

    // 포트폴리오 설정 버튼
    dom.addNewStockBtn?.addEventListener('click', () => view.emit('addNewStockClicked'));
    dom.resetDataBtn?.addEventListener('click', () => view.emit('resetDataClicked'));
    dom.normalizeRatiosBtn?.addEventListener('click', () => view.emit('normalizeRatiosClicked'));
    dom.fetchAllPricesBtn?.addEventListener('click', () => view.emit('fetchAllPricesClicked'));

    // 데이터 관리 드롭다운
    const dataManagementBtn = /** @type {HTMLButtonElement | null} */ (dom.dataManagementBtn);
    const dataDropdownContent = /** @type {HTMLElement | null} */ (dom.dataDropdownContent);
    const exportDataBtn = /** @type {HTMLAnchorElement | null} */ (dom.exportDataBtn);
    const importDataBtn = /** @type {HTMLAnchorElement | null} */ (dom.importDataBtn);
    const importFileInput = /** @type {HTMLInputElement | null} */ (dom.importFileInput);
    const dropdownItems = dataDropdownContent?.querySelectorAll('a[role="menuitem"]') ?? [];

    const toggleDropdown = (show) => {
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
            (/** @type {HTMLElement} */ (dropdownItems[0])).focus();
        }
    });

    dataDropdownContent?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const currentIndex = Array.from(dropdownItems).indexOf(target);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % dropdownItems.length;
                (/** @type {HTMLElement} */ (dropdownItems[nextIndex])).focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + dropdownItems.length) % dropdownItems.length;
                (/** @type {HTMLElement} */ (dropdownItems[prevIndex])).focus();
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
        view.emit('exportDataClicked'); // view.emit으로 변경
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    importDataBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        view.emit('importDataClicked'); // view.emit으로 변경
        toggleDropdown(false);
        dataManagementBtn?.focus();
    });

    window.addEventListener('click', (e) => {
        const target = /** @type {Node | null} */ (e.target);
        if (dataManagementBtn && dataDropdownContent?.classList.contains('show') && !dataManagementBtn.contains(target)) {
            toggleDropdown(false);
        }
    });

    importFileInput?.addEventListener('change', (e) => view.emit('fileSelected', e)); // view.emit으로 변경

    // 포트폴리오 테이블 입력 처리
    dom.virtualScrollWrapper?.addEventListener('change', (e) =>
        view.emit('portfolioBodyChanged', e) // view.emit으로 변경
    );
    dom.virtualScrollWrapper?.addEventListener('click', (e) =>
        view.emit('portfolioBodyClicked', e) // view.emit으로 변경
    );

    // 포트폴리오 테이블 키보드 네비게이션
    const virtualScrollWrapper = dom.virtualScrollWrapper;
    virtualScrollWrapper?.addEventListener('keydown', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target || !(target.matches('input[type="text"], input[type="number"], input[type="checkbox"]'))) return;

        const currentRow = target.closest('div[data-id]');
        if (!currentRow?.dataset.id) return;
        const stockId = currentRow.dataset.id;
        const currentCell = target.closest('.virtual-cell');
        const currentCellIndex = currentCell ? Array.from(currentRow.children).indexOf(currentCell) : -1;
        const field = target.dataset.field;

        switch (e.key) {
            case 'Enter':
                 if (field === 'ticker') {
                    e.preventDefault();
                    // 컨트롤러가 할 일(모달 열기)을 View에 이벤트로 알림
                    view.emit('manageStockClicked', { stockId });
                 }
                 else if (currentCellIndex !== -1 && currentRow instanceof HTMLDivElement) { // Type guard
                    e.preventDefault();
                    const direction = e.shiftKey ? -1 : 1;
                    const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                    const nextCell = currentRow.children[nextCellIndex];
                    const nextInput = /** @type {HTMLElement | null} */ (nextCell?.querySelector('input'));
                    nextInput?.focus();
                 }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const siblingRow = (e.key === 'ArrowUp')
                    ? currentRow.previousElementSibling?.previousElementSibling
                    : currentRow.nextElementSibling?.nextElementSibling;

                if (siblingRow instanceof HTMLDivElement && siblingRow.matches('.virtual-row-inputs') && currentCellIndex !== -1) { // Type guard
                     const targetCell = siblingRow.children[currentCellIndex];
                     const targetInput = /** @type {HTMLElement | null} */ (targetCell?.querySelector('input'));
                     targetInput?.focus();
                }
                break;
             case 'ArrowLeft':
             case 'ArrowRight':
                 if (target instanceof HTMLInputElement && (target.type !== 'text' || target.selectionStart === (e.key === 'ArrowLeft' ? 0 : target.value.length)) && currentRow instanceof HTMLDivElement) { // Type guards
                     e.preventDefault();
                     const direction = e.key === 'ArrowLeft' ? -1 : 1;
                     const nextCellIndex = (currentCellIndex + direction + currentRow.children.length) % currentRow.children.length;
                     const nextCell = currentRow.children[nextCellIndex];
                     const nextInput = /** @type {HTMLElement | null} */ (nextCell?.querySelector('input'));
                     nextInput?.focus();
                 }
                 break;
            case 'Delete':
                if (e.ctrlKey && field === 'name') {
                     e.preventDefault();
                     view.emit('deleteStockShortcut', { stockId }); // 삭제 이벤트 발행
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
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.tagName === 'INPUT' && target.type === 'number') {
            target.select();
        }
    });

    // 계산 버튼
    dom.calculateBtn?.addEventListener('click', () => view.emit('calculateClicked')); // view.emit으로 변경
    dom.calculateBtn?.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            view.emit('calculateClicked'); // view.emit으로 변경
        }
    });

    // 계산/통화 모드 라디오 버튼
    dom.mainModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const mode = /** @type {'add' | 'sell' | 'simple'} */ ((/** @type {HTMLInputElement} */ (e.target)).value);
        view.emit('mainModeChanged', { mode }); // view.emit으로 변경
    }));
    dom.currencyModeSelector?.forEach(r => r.addEventListener('change', (e) => {
        const currency = /** @type {'krw' | 'usd'} */ ((/** @type {HTMLInputElement} */ (e.target)).value);
        view.emit('currencyModeChanged', { currency }); // view.emit으로 변경
    }));

    // 추가 투자금액 입력 및 환율 변환
    const debouncedConversion = debounce((source) => view.emit('currencyConversion', { source }), 300); // view.emit으로 변경
    dom.additionalAmountInput?.addEventListener('input', () => debouncedConversion('krw'));
    dom.additionalAmountUSDInput?.addEventListener('input', () => debouncedConversion('usd'));
    dom.exchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        const rate = parseFloat(target.value);
        const isValid = !isNaN(rate) && rate > 0;
        view.toggleInputValidation(target, isValid); // View 자체 검증은 유지
        if (isValid) debouncedConversion('krw'); 
    });

    // 추가 투자금액 관련 필드 Enter 키 처리
    const handleEnterKey = (e) => {
        if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement && e.target.isComposing)) { // Type guard and isComposing check
            e.preventDefault();
            view.emit('calculateClicked'); // view.emit으로 변경
        }
    };
    dom.additionalAmountInput?.addEventListener('keydown', handleEnterKey);
    dom.additionalAmountUSDInput?.addEventListener('keydown', handleEnterKey);
    dom.exchangeRateInput?.addEventListener('keydown', handleEnterKey);

    // 포트폴리오 환율 설정
    dom.portfolioExchangeRateInput?.addEventListener('input', (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
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

    // 추가 투자금 섹션의 환율 변경 시 포트폴리오 환율과 동기화
    const originalExchangeRateHandler = dom.exchangeRateInput;
    if (originalExchangeRateHandler) {
        originalExchangeRateHandler.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
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
    dom.closeModalBtn?.addEventListener('click', () => view.emit('closeTransactionModalClicked')); // view.emit으로 변경

    // 새 거래 추가 폼 제출
    dom.newTransactionForm?.addEventListener('submit', (e) => view.emit('newTransactionSubmitted', e)); // view.emit으로 변경

    // 입력 방식 전환 (수량 입력 vs 금액 입력)
    const inputModeQuantity = document.getElementById('inputModeQuantity');
    const inputModeAmount = document.getElementById('inputModeAmount');
    const quantityInputGroup = document.getElementById('quantityInputGroup');
    const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
    const txQuantityInput = /** @type {HTMLInputElement | null} */ (document.getElementById('txQuantity'));
    const txTotalAmountInput = /** @type {HTMLInputElement | null} */ (document.getElementById('txTotalAmount'));
    const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

    const toggleInputMode = () => {
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

    // 금액 입력 모드에서 총 금액 또는 단가 변경 시 수량 자동 계산
    const calculateQuantityFromAmount = () => {
        const isAmountMode = inputModeAmount instanceof HTMLInputElement && inputModeAmount.checked;
        if (!isAmountMode) return;

        const txPriceInput = /** @type {HTMLInputElement | null} */ (document.getElementById('txPrice'));
        const calculatedQuantityValue = document.getElementById('calculatedQuantityValue');

        if (txTotalAmountInput && txPriceInput && calculatedQuantityValue) {
            const totalAmount = parseFloat(txTotalAmountInput.value) || 0;
            const price = parseFloat(txPriceInput.value) || 0;

            if (price > 0 && totalAmount > 0) {
                const quantity = totalAmount / price;
                calculatedQuantityValue.textContent = quantity.toFixed(8);
            } else {
                calculatedQuantityValue.textContent = '0';
            }
        }
    };

    txTotalAmountInput?.addEventListener('input', calculateQuantityFromAmount);
    document.getElementById('txPrice')?.addEventListener('input', calculateQuantityFromAmount);

    // 거래 내역 목록 내 삭제 버튼 클릭 (이벤트 위임)
    dom.transactionModal?.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target);
        const deleteButton = target.closest('button[data-action="delete-tx"]');

        // 1. 삭제 버튼이 클릭된 경우 핸들러 호출
        if (deleteButton) {
            const row = deleteButton.closest('tr[data-tx-id]');
            const modal = deleteButton.closest('#transactionModal');
            const stockId = modal?.dataset.stockId;
            const txId = row?.dataset.txId;

            // 2. 컨트롤러 함수에 필요한 ID 직접 전달
            if (stockId && txId) {
                // controller.handleTransactionListClick(stockId, txId) 대신 emit
                view.emit('transactionDeleteClicked', { stockId, txId }); 
            }
        }

        // 3. 모달 오버레이 클릭 시 닫기
        if (e.target === dom.transactionModal) {
             view.emit('closeTransactionModalClicked'); // view.emit으로 변경
        }
    });

    // --- 기타 ---
    // 다크 모드 토글 버튼
    dom.darkModeToggle?.addEventListener('click', () => view.emit('darkModeToggleClicked')); // view.emit으로 변경
    // 페이지 닫기 전 자동 저장 (동기식 저장 시도)
    window.addEventListener('beforeunload', () => view.emit('pageUnloading')); // view.emit으로 변경

    // 키보드 네비게이션 포커스 스타일
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}
```

---

## `js/view.js`

```javascript
// js/view.js (가상 스크롤 적용)
// @ts-check
import { CONFIG } from './constants.js';
import { formatCurrency, escapeHTML } from './utils.js';
import { t } from './i18n.js';
import Decimal from 'decimal.js';

/** @typedef {import('./types.js').Stock} Stock */
/** @typedef {import('./types.js').CalculatedStock} CalculatedStock */

// ▼▼▼▼▼ [추가] 가상 스크롤 상수 ▼▼▼▼▼
const ROW_INPUT_HEIGHT = 60; // .virtual-row-inputs의 height
const ROW_OUTPUT_HEIGHT = 50; // .virtual-row-outputs의 height
const ROW_PAIR_HEIGHT = ROW_INPUT_HEIGHT + ROW_OUTPUT_HEIGHT; // 한 종목(2줄)의 총 높이
const VISIBLE_ROWS_BUFFER = 5; // 화면 밖 위/아래로 미리 렌더링할 행 수
// ▲▲▲▲▲ [추가] ▲▲▲▲▲

export const PortfolioView = {
    /** @type {Record<string, HTMLElement | NodeListOf<HTMLElement> | null>} */
    dom: {},
    /** @type {import('chart.js').Chart | null} */
    chartInstance: null,
    /** @type {IntersectionObserver | null} */
    currentObserver: null,
    /** @type {((value: any) => void) | null} */
    activeModalResolver: null,
    /** @type {HTMLElement | null} */
    lastFocusedElement: null,
    /** @type {Object<string, Function[]>} */
    _events: {}, // 1. 이벤트 리스너 저장소 추가

    // ▼▼▼▼▼ [추가] 가상 스크롤 상태 변수 ▼▼▼▼▼
    /** @type {CalculatedStock[]} */
    _virtualData: [],
    /** @type {HTMLElement | null} */
    _scrollWrapper: null,
    /** @type {HTMLElement | null} */
    _scrollSpacer: null,
    /** @type {HTMLElement | null} */
    _scrollContent: null,
    /** @type {number} */
    _viewportHeight: 0,
    /** @type {number} */
    _renderedStartIndex: -1,
    /** @type {number} */
    _renderedEndIndex: -1,
    /** @type {Function | null} */
    _scrollHandler: null,
    /** @type {string} */
    _currentMainMode: 'add',
    /** @type {string} */
    _currentCurrency: 'krw',
    // ▲▲▲▲▲ [추가] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] Pub/Sub 메서드 ▼▼▼▼▼
    /**
     * @description 추상 이벤트를 구독합니다.
     * @param {string} event - 이벤트 이름 (예: 'calculateClicked')
     * @param {Function} callback - 실행할 콜백 함수
     */
    on(event, callback) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(callback);
    },

    /**
     * @description 추상 이벤트를 발행합니다.
     * @param {string} event - 이벤트 이름
     * @param {any} [data] - 전달할 데이터
     */
    emit(event, data) {
        if (this._events[event]) {
            this._events[event].forEach(callback => callback(data));
        }
    },
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    cacheDomElements() {
        const D = document;
        this.dom = {
            ariaAnnouncer: D.getElementById('aria-announcer'),
            // portfolioBody: D.getElementById('portfolioBody'), // 삭제
            resultsSection: D.getElementById('resultsSection'),
            sectorAnalysisSection: D.getElementById('sectorAnalysisSection'),
            chartSection: D.getElementById('chartSection'),
            portfolioChart: D.getElementById('portfolioChart'),
            additionalAmountInput: D.getElementById('additionalAmount'),
            additionalAmountUSDInput: D.getElementById('additionalAmountUSD'),
            exchangeRateInput: D.getElementById('exchangeRate'),
            portfolioExchangeRateInput: D.getElementById('portfolioExchangeRate'),
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
            dataManagementBtn: D.getElementById('dataManagementBtn'),
            dataDropdownContent: D.getElementById('dataDropdownContent'),
            exportDataBtn: D.getElementById('exportDataBtn'),
            importDataBtn: D.getElementById('importDataBtn'),
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
            // portfolioTableHead: D.getElementById('portfolioTableHead'), // 삭제
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
        };
        
        this._events = {}; // 캐시 초기화 시 이벤트 리스너도 초기화
        
        // ▼▼▼▼▼ [추가] 가상 스크롤 래퍼 캐시 ▼▼▼▼▼
        this._scrollWrapper = this.dom.virtualScrollWrapper;
        this._scrollSpacer = this.dom.virtualScrollSpacer;
        this._scrollContent = this.dom.virtualScrollContent;
        this._viewportHeight = this._scrollWrapper ? this._scrollWrapper.clientHeight : 600;
        // ▲▲▲▲▲ [추가] ▲▲▲▲▲


        const cancelBtn = this.dom.customModalCancel;
        const confirmBtn = this.dom.customModalConfirm;
        const customModalEl = this.dom.customModal;
        cancelBtn?.addEventListener('click', () => this._handleCustomModal(false));
        confirmBtn?.addEventListener('click', () => this._handleCustomModal(true));
        customModalEl?.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._handleCustomModal(false); });
    },

    announce(message, politeness = 'polite') {
        const announcer = this.dom.ariaAnnouncer;
        if (announcer) {
            announcer.textContent = '';
            announcer.setAttribute('aria-live', politeness);
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    },
    async showConfirm(title, message) {
        return this._showModal({ title, message, type: 'confirm' });
    },
    async showPrompt(title, message, defaultValue = '') {
        return this._showModal({ title, message, defaultValue, type: 'prompt' });
    },
    _showModal(options) {
        return new Promise((resolve) => {
            this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
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
                this._trapFocus(modalEl);
            }
            if (type === 'prompt' && inputEl instanceof HTMLInputElement) {
                inputEl.focus();
            } else if (confirmBtnEl instanceof HTMLButtonElement){
                confirmBtnEl.focus();
            }
        });
    },
    _handleCustomModal(confirmed) {
        if (!this.activeModalResolver) return;
        const inputEl = this.dom.customModalInput;
        const modalEl = this.dom.customModal;
        const isPrompt = inputEl instanceof HTMLInputElement && !inputEl.classList.contains('hidden');
        const value = isPrompt ? (confirmed ? inputEl.value : null) : confirmed;
        this.activeModalResolver(value);
        modalEl?.classList.add('hidden');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
        this.activeModalResolver = null;
        this.lastFocusedElement = null;
    },
    _trapFocus(element) {
        if (!element) return;
        const focusableEls = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableEls.length === 0) return;
        const firstFocusableEl = /** @type {HTMLElement} */ (focusableEls[0]);
        const lastFocusableEl = /** @type {HTMLElement} */ (focusableEls[focusableEls.length - 1]);
        element.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableEl) { lastFocusableEl.focus(); e.preventDefault(); }
            } else {
                if (document.activeElement === lastFocusableEl) { firstFocusableEl.focus(); e.preventDefault(); }
            }
        });
    },
    renderPortfolioSelector(portfolios, activeId) {
        const selector = this.dom.portfolioSelector;
        if (!(selector instanceof HTMLSelectElement)) return;
        selector.innerHTML = '';
        Object.entries(portfolios).forEach(([id, portfolio]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = portfolio.name;
            option.selected = (id === activeId);
            selector.appendChild(option);
        });
    },

    // ▼▼▼▼▼ [대대적 수정] createStockRowFragment (div 기반으로 변경) ▼▼▼▼▼
    createStockRowFragment(stock, currency, mainMode) {
        const fragment = document.createDocumentFragment();

        // --- 헬퍼 함수 ---
        const createInput = (type, field, value, placeholder = '', disabled = false, ariaLabel = '') => {
            const input = document.createElement('input');
            input.type = type;
            input.dataset.field = field;
            let displayValue = '';
            if (value instanceof Decimal) {
                const decimalPlaces = (field === 'fixedBuyAmount' ? 0 : 2);
                displayValue = value.toFixed(decimalPlaces);
            } else {
                 const defaultValue = (field === 'fixedBuyAmount' ? '0' : (field === 'targetRatio' || field === 'currentPrice' ? '0.00' : ''));
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

        const createCell = (className = '', align = 'left') => {
            const cell = document.createElement('div');
            cell.className = `virtual-cell ${className} align-${align}`;
            return cell;
        };

        // --- 1. 입력 행 (Inputs Row) ---
        const divInputs = document.createElement('div');
        divInputs.className = 'virtual-row-inputs';
        divInputs.dataset.id = stock.id;
        divInputs.setAttribute('role', 'row');
        // 그리드 템플릿 설정 (CSS 대신 JS에서)
        divInputs.style.gridTemplateColumns = this.getGridTemplate(mainMode);

        const isMobile = window.innerWidth <= 768;

        // 컬럼 구성
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'name', stock.name, t('ui.stockName')));
        divInputs.appendChild(createCell()).appendChild(createInput('text', 'ticker', stock.ticker, t('ui.ticker'), false, t('aria.tickerInput', { name: stock.name })));

        // 간단 계산 모드에서는 섹터, 고정 매수 필드만 숨김 (목표비중은 유지)
        if (mainMode !== 'simple' && !isMobile) {
            // 섹터는 간단 모드가 아닐 때만 표시
            divInputs.appendChild(createCell()).appendChild(createInput('text', 'sector', stock.sector || '', t('ui.sector'), false, t('aria.sectorInput', { name: stock.name })));
        }

        // 목표 비율은 모든 모드에서 표시
        divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'targetRatio', stock.targetRatio, '0.00', false, t('aria.targetRatioInput', { name: stock.name })));

        if (!isMobile && mainMode !== 'simple') {
            // 현재가는 간단 모드가 아닐 때만 표시
            divInputs.appendChild(createCell('align-right')).appendChild(createInput('number', 'currentPrice', stock.currentPrice, '0.00', false, t('aria.currentPriceInput', { name: stock.name })));
        }

        if (mainMode === 'simple') {
            // 간단 모드: 보유 금액 입력칸 + 고정 매수 필드 + 삭제 버튼
            const amountCell = createCell('align-right');
            const manualAmountInput = createInput('number', 'manualAmount', stock.manualAmount || 0, '현재 보유 금액 입력', false, `${stock.name} 보유 금액`);
            manualAmountInput.style.width = '100%';
            manualAmountInput.style.textAlign = 'right';
            amountCell.appendChild(manualAmountInput);
            divInputs.appendChild(amountCell);

            // 고정 매수 필드 추가 (간단 모드)
            if (!isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
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
            // 추가 매수 모드: 고정 매수 필드 표시
            if (mainMode === 'add' && !isMobile) {
                const fixedBuyCell = createCell('align-center');
                const checkbox = createCheckbox('isFixedBuyEnabled', stock.isFixedBuyEnabled, t('aria.fixedBuyToggle', { name: stock.name }));
                const amountInput = createInput('number', 'fixedBuyAmount', stock.fixedBuyAmount, '0', !stock.isFixedBuyEnabled, t('aria.fixedBuyAmount', { name: stock.name }));
                amountInput.style.width = '80px';
                fixedBuyCell.append(checkbox, ' ', amountInput);
                divInputs.appendChild(fixedBuyCell);
            }

            // 일반 모드: 거래 내역 관리 및 삭제 버튼
            const actionCell = createCell('align-center');
            actionCell.append(
                createButton('manage', t('ui.manage'), t('aria.manageTransactions', { name: stock.name }), 'blue'),
                ' ',
                createButton('delete', t('ui.delete'), t('aria.deleteStock', { name: stock.name }), 'delete')
            );
            divInputs.appendChild(actionCell);
        }

        // --- 2. 출력 행 (Outputs Row) ---
        const divOutputs = document.createElement('div');
        divOutputs.className = 'virtual-row-outputs';
        divOutputs.dataset.id = stock.id;
        divOutputs.setAttribute('role', 'row');
        divOutputs.style.gridTemplateColumns = this.getGridTemplate(mainMode); // 동일한 그리드 사용

        const metrics = stock.calculated ?? {
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

        const createOutputCell = (label, value, valueClass = '') => {
            const cell = createCell('output-cell align-right');
            cell.innerHTML = `<span class="label">${escapeHTML(label)}</span><span class="value ${escapeHTML(valueClass)}">${escapeHTML(value)}</span>`;
            return cell;
        };

        const firstCell = createCell(); // 첫 번째 빈 셀 (스페이서)
        firstCell.style.gridColumn = 'span 1'; // 첫 번째 컬럼 차지
        divOutputs.appendChild(firstCell);

        // 출력 행 컬럼 구성
        if (mainMode === 'simple') {
            // 간단 모드에서는 출력 행을 완전히 숨김 (보유 금액을 입력칸에서 바로 입력하므로)
            divOutputs.style.display = 'none';
        } else {
            // 일반 모드
            divOutputs.appendChild(createOutputCell(t('ui.quantity'), quantity.toFixed(0)));
            if (!isMobile) { // 모바일 아닐 때
                divOutputs.appendChild(createOutputCell(t('ui.avgBuyPrice'), formatCurrency(avgBuyPrice, currency)));
            }
            divOutputs.appendChild(createOutputCell(t('ui.currentValue'), formatCurrency(currentAmount, currency)));
            if (!isMobile) { // 모바일 아닐 때
                divOutputs.appendChild(createOutputCell(t('ui.profitLoss'), `${profitSign}${formatCurrency(profitLoss, currency)}`, profitClass));
            }
            divOutputs.appendChild(createOutputCell(t('ui.profitLossRate'), `${profitSign}${profitLossRate.toFixed(2)}%`, profitClass));
        }

        // 액션 컬럼 스페이서
        const lastCell = createCell();
        divOutputs.appendChild(lastCell);

        fragment.append(divInputs, divOutputs);
        return fragment;
    },
    // ▲▲▲▲▲ [대대적 수정] ▲▲▲▲▲

    // ▼▼▼▼▼ [수정] updateStockRowOutputs (더 이상 사용 안 함) ▼▼▼▼▼
    updateStockRowOutputs(id, stock, currency, mainMode) {
        // 이 함수는 가상 스크롤에서 전체 재조정 로직(_onScroll)으로 대체됨
        // console.warn("updateStockRowOutputs is deprecated with Virtual Scroll");
    },
    // ▲▲▲▲▲ [수정] ▲▲▲▲▲

    updateAllTargetRatioInputs(portfolioData) {
        // 가상 스크롤에서는 보이는 부분만 업데이트해야 함
        portfolioData.forEach(stock => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stock.id}"]`);
            if (!inputRow) return; // 화면에 안보이면 스킵
            const targetRatioInput = inputRow.querySelector('input[data-field="targetRatio"]');
            if (targetRatioInput instanceof HTMLInputElement) {
                const ratio = stock.targetRatio instanceof Decimal ? stock.targetRatio : new Decimal(stock.targetRatio ?? 0);
                targetRatioInput.value = ratio.toFixed(2);
            }
        });
    },

    updateCurrentPriceInput(id, price) {
        const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${id}"]`);
        if (!inputRow) return; // 화면에 안보이면 스킵
        const currentPriceInput = inputRow.querySelector('input[data-field="currentPrice"]');
        if (currentPriceInput instanceof HTMLInputElement) {
            currentPriceInput.value = price;
        }
    },
    
    // ▼▼▼▼▼ [추가] 가상 스크롤 헬퍼 ▼▼▼▼▼
    getGridTemplate(mainMode) {
        // 반응형 그리드 템플릿 반환
        const isMobile = window.innerWidth <= 768;

        // 입력 행과 출력 행의 그리드 컬럼 수를 다르게 설정
        if (isMobile) {
            if (mainMode === 'simple') {
                // 모바일 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 삭제 (5컬럼)
                return '1.5fr 1fr 1fr 1fr 0.8fr';
            }
            // 모바일: 이름 | 티커 | 목표% | 액션 (입력)
            // 모바일: (스페이서) | 수량 | 평가액 | 수익률 | (스페이서) (출력)
            // -> 컬럼 수는 4개로 동일하게 맞추되, 내용만 다르게
            return '1.5fr 1fr 1fr 1.2fr';
        } else {
            // 데스크탑
            if (mainMode === 'add') {
                // 이름 | 티커 | 섹터 | 목표% | 현재가 | 고정 | 액션 (7컬럼)
                // (스페이서) | 수량 | 평단가 | 목표% | 평가액 | 수익률 | (스페이서) (7컬럼)
                return '1.5fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr';
            } else if (mainMode === 'simple') {
                // 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 고정 매수 | 삭제 (6컬럼)
                return '2fr 1fr 1fr 1.5fr 1.2fr 0.8fr';
            } else {
                // 매도 리밸런싱: 이름 | 티커 | 섹터 | 목표% | 현재가 | 액션 (6컬럼)
                // (스페이서) | 수량 | 평단가 | 목표% | 평가액 | 수익률 | (스페이서) (6컬럼)
                return '2fr 1fr 1fr 1fr 1fr 1.2fr';
            }
        }
    },
    
    // updateTableHeader를 새 div 헤더에 맞게 수정
    updateTableHeader(currency, mainMode) {
        this._currentMainMode = mainMode; // 현재 모드 저장
        this._currentCurrency = currency; // 현재 통화 저장
        const header = this.dom.virtualTableHeader;
        if (!header) return;

        header.style.gridTemplateColumns = this.getGridTemplate(mainMode);

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
                // 간단 모드: 이름 | 티커 | 목표% | 보유 금액 | 고정 매수 | 삭제
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
    },

    // ▼▼▼▼▼ [대대적 수정] renderTable (가상 스크롤 초기화 로직) ▼▼▼▼▼
    renderTable(calculatedPortfolioData, currency, mainMode) {
        if (!this._scrollWrapper || !this._scrollSpacer || !this._scrollContent) return;

        // 1. 헤더 업데이트 (모드, 통화 저장)
        this.updateTableHeader(currency, mainMode);
        
        // 2. 데이터 저장
        this._virtualData = calculatedPortfolioData;
        if(this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        // 3. 전체 높이 설정
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        this._scrollSpacer.style.height = `${totalHeight}px`;
        
        // 4. 뷰포트 높이 갱신
        this._viewportHeight = this._scrollWrapper.clientHeight;

        // 5. 기존 스크롤 이벤트 리스너 제거
        if (this._scrollHandler) {
            this._scrollWrapper.removeEventListener('scroll', this._scrollHandler);
        }

        // 6. 스크롤 이벤트 핸들러 생성 및 바인딩
        // _onScroll 내부에서 this가 view를 가리키도록 .bind(this) 사용
        this._scrollHandler = this._onScroll.bind(this);
        this._scrollWrapper.addEventListener('scroll', this._scrollHandler);

        // 7. 초기 렌더링 실행
        this._onScroll(true); // forceRedraw = true
    },
    
    /**
     * @description [NEW] 컨트롤러가 데이터를 업데이트할 때 호출
     */
    updateVirtualTableData(calculatedPortfolioData) {
        this._virtualData = calculatedPortfolioData; // 데이터 교체
        const totalHeight = this._virtualData.length * ROW_PAIR_HEIGHT;
        if(this._scrollSpacer) this._scrollSpacer.style.height = `${totalHeight}px`;
        if(this.dom.virtualScrollWrapper) {
            this.dom.virtualScrollWrapper.setAttribute('aria-rowcount', String(this._virtualData.length));
        }

        // 현재 스크롤 위치에서 강제로 다시 렌더링
        this._onScroll(true); // forceRedraw = true
    },

    /**
     * @description [NEW] 특정 종목의 속성을 _virtualData에서 업데이트 (재렌더링 없이)
     * @param {string} stockId - 종목 ID
     * @param {string} field - 업데이트할 필드명
     * @param {any} value - 새 값
     */
    updateStockInVirtualData(stockId, field, value) {
        const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
        if (stockIndex !== -1) {
            this._virtualData[stockIndex][field] = value;
        }
    },

    /**
     * @description [NEW] 실제 가상 스크롤 렌더링 로직
     * @param {boolean} [forceRedraw=false] - 강제 렌더링 여부
     */
    _onScroll(forceRedraw = false) {
        if (!this._scrollWrapper || !this._scrollContent) return;

        // 클래스 멤버 변수에서 현재 모드와 통화 읽기
        const currency = this._currentCurrency;
        const mainMode = this._currentMainMode;

        const scrollTop = this._scrollWrapper.scrollTop;

        // 1. 렌더링할 인덱스 계산
        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_PAIR_HEIGHT) - VISIBLE_ROWS_BUFFER);
        const endIndex = Math.min(
            this._virtualData.length, // 배열 최대 길이 넘지 않도록 수정
            Math.ceil((scrollTop + this._viewportHeight) / ROW_PAIR_HEIGHT) + VISIBLE_ROWS_BUFFER
        );

        // 2. 이미 렌더링된 범위면 실행 취소 (강제 재조정 제외)
        if (!forceRedraw && startIndex === this._renderedStartIndex && endIndex === this._renderedEndIndex) {
            return;
        }

        // ▼▼▼▼▼ [추가] 재렌더링 전에 현재 DOM의 입력 값을 _virtualData에 저장 ▼▼▼▼▼
        // 스크롤로 인해 DOM이 사라지기 전에 사용자가 입력 중인 값을 보존
        const currentInputRows = this._scrollContent.querySelectorAll('.virtual-row-inputs[data-id]');
        currentInputRows.forEach(row => {
            const stockId = row.dataset.id;
            if (!stockId) return;

            const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
            if (stockIndex === -1) return;

            // 모든 입력 필드의 현재 값을 읽어서 _virtualData에 반영
            const inputs = row.querySelectorAll('input[data-field]');
            inputs.forEach(input => {
                if (!(input instanceof HTMLInputElement)) return;
                const field = input.dataset.field;
                if (!field) return;

                let value;
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number') {
                    // 숫자 필드는 parseFloat으로 변환
                    value = parseFloat(input.value) || 0;
                } else {
                    value = input.value;
                }

                // _virtualData 업데이트
                this._virtualData[stockIndex][field] = value;
            });
        });
        // ▲▲▲▲▲ [추가] ▲▲▲▲▲

        // 3. 새 범위 저장
        this._renderedStartIndex = startIndex;
        this._renderedEndIndex = endIndex;

        // 4. DOM 조각 생성
        const fragment = document.createDocumentFragment();
        for (let i = startIndex; i < endIndex; i++) {
            const stock = this._virtualData[i];
            fragment.appendChild(this.createStockRowFragment(stock, currency, mainMode));
        }

        // 5. 실제 DOM에 적용 및 Y축 위치 이동
        this._scrollContent.innerHTML = ''; // 기존 행 삭제
        this._scrollContent.appendChild(fragment);
        this._scrollContent.style.transform = `translateY(${startIndex * ROW_PAIR_HEIGHT}px)`;
    },
    // ▲▲▲▲▲ [대대적 수정] ▲▲▲▲▲

    // toggleFixedBuyColumn은 더 이상 사용되지 않음

    updateRatioSum(totalRatio) {
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
    },

    updateMainModeUI(mainMode) {
        const addCard = this.dom.addInvestmentCard;
        const modeRadios = this.dom.mainModeSelector;

        // Show investment card for both 'add' and 'simple' modes
        addCard?.classList.toggle('hidden', mainMode !== 'add' && mainMode !== 'simple');

        modeRadios?.forEach(radio => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === mainMode;
        });
        this.hideResults();
    },

    updateCurrencyModeUI(currencyMode) {
        const isUsdMode = currencyMode === 'usd';
        const rateGroup = this.dom.exchangeRateGroup;
        const usdGroup = this.dom.usdInputGroup;
        const currencyRadios = this.dom.currencyModeSelector;
        const usdInput = this.dom.additionalAmountUSDInput;
        rateGroup?.classList.toggle('hidden', !isUsdMode);
        usdGroup?.classList.toggle('hidden', !isUsdMode);
        currencyRadios?.forEach(radio => {
            if (radio instanceof HTMLInputElement) radio.checked = radio.value === currencyMode;
        });
        if (!isUsdMode && usdInput instanceof HTMLInputElement) usdInput.value = '';
    },

    openTransactionModal(stock, currency, transactions) {
        this.lastFocusedElement = /** @type {HTMLElement} */ (document.activeElement);
        const modal = this.dom.transactionModal;
        const modalTitle = this.dom.modalStockName;
        const dateInput = this.dom.txDate;
        if (!modal) return;
        modal.dataset.stockId = stock.id;
        if(modalTitle) {
            modalTitle.textContent = `${stock.name} (${stock.ticker}) ${t('modal.transactionTitle')}`;
        }
        this.renderTransactionList(transactions || [], currency);
        if(dateInput instanceof HTMLInputElement) dateInput.valueAsDate = new Date();
        modal.classList.remove('hidden');
        this._trapFocus(modal);
        const closeBtn = this.dom.closeModalBtn;
        if (closeBtn instanceof HTMLButtonElement) closeBtn.focus();
    },

    closeTransactionModal() {
        const modal = this.dom.transactionModal;
        const form = this.dom.newTransactionForm;
        if (!modal) return;
        modal.classList.add('hidden');
        if(form instanceof HTMLFormElement) form.reset();
        modal.removeAttribute('data-stock-id');
        if (this.lastFocusedElement) this.lastFocusedElement.focus();
    },

    renderTransactionList(transactions, currency) {
        const listBody = this.dom.transactionListBody;
        if (!listBody) {
            console.error("View: renderTransactionList - listBody not found!");
            return;
        }
        
        listBody.innerHTML = ''; // 1. 기존 내용 지우기

        if (transactions.length === 0) {
            const tr = listBody.insertRow(); 
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

        sorted.forEach(tx => {
            const tr = listBody.insertRow();
            tr.dataset.txId = tx.id;
            const quantityDec = tx.quantity instanceof Decimal ? tx.quantity : new Decimal(tx.quantity || 0);
            const priceDec = tx.price instanceof Decimal ? tx.price : new Decimal(tx.price || 0);
            const total = quantityDec.times(priceDec);

            tr.insertCell().textContent = tx.date;
            const typeTd = tr.insertCell();
            const typeSpan = document.createElement('span');
            typeSpan.className = tx.type === 'buy' ? 'text-buy' : 'text-sell';
            typeSpan.textContent = tx.type === 'buy' ? t('ui.buy') : t('ui.sell');
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
    },

    displaySkeleton() {
        const skeletonHTML = `...`; // 생략
        const resultsEl = this.dom.resultsSection;
        if (!resultsEl) return;
        resultsEl.innerHTML = skeletonHTML;
        resultsEl.classList.remove('hidden');
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    cleanupObserver() {
        if (this.currentObserver) { this.currentObserver.disconnect(); this.currentObserver = null; }
    },

    destroyChart() {
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
    },

    cleanup() {
        this.cleanupObserver();
        this.destroyChart();
    },

    hideResults() {
        const resultsEl = this.dom.resultsSection;
        const sectorEl = this.dom.sectorAnalysisSection;
        const chartEl = this.dom.chartSection;
        if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.classList.add('hidden'); }
        if (sectorEl) { sectorEl.innerHTML = ''; sectorEl.classList.add('hidden'); }
        if (chartEl) { chartEl.classList.add('hidden'); }
        this.cleanupObserver();
    },

    displayResults(html) {
        requestAnimationFrame(() => {
            const resultsEl = this.dom.resultsSection;
            if (!resultsEl) return;
            resultsEl.innerHTML = html;
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
             this.announce(t('aria.resultsLoaded'), 'assertive');
            const rows = resultsEl.querySelectorAll('.result-row-highlight');
            if (rows.length === 0) return;
            this.cleanupObserver();
            this.currentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = /** @type {HTMLElement} */ (entry.target);
                        target.style.transitionDelay = target.dataset.delay || '0s';
                        target.classList.add('in-view');
                        this.currentObserver?.unobserve(target);
                    }
                });
            }, { threshold: 0.1 });
            rows.forEach((row) => this.currentObserver?.observe(row));
        });
    },

    displaySectorAnalysis(html) {
         requestAnimationFrame(() => {
            const sectorEl = this.dom.sectorAnalysisSection;
            if (!sectorEl) return;
            sectorEl.innerHTML = html;
            sectorEl.classList.remove('hidden');
        });
    },

    displayChart(Chart, labels, data, title) {
        const chartEl = this.dom.chartSection;
        const canvas = this.dom.portfolioChart;
        if (!chartEl || !(canvas instanceof HTMLCanvasElement)) return;
        chartEl.classList.remove('hidden');
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title, font: { size: 16 } }
            }
        };
        const chartData = {
            labels: labels,
            datasets: [{
                label: t('template.ratio'),
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#77DD77', '#FDFD96', '#836FFF', '#FFB347', '#FFD1DC'],
                borderColor: document.body.classList.contains('dark-mode') ? '#2d2d2d' : '#ffffff',
                borderWidth: 2
            }]
        };
        if (this.chartInstance) {
            this.chartInstance.data = chartData;
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

    toggleInputValidation(inputElement, isValid, errorMessage = '') {
        if (!inputElement) return;
        inputElement.classList.toggle('input-invalid', !isValid);
        inputElement.setAttribute('aria-invalid', String(!isValid));
    },


    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        const toast = document.createElement('div');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = message.replace(/\n/g, '<br>');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    focusOnNewStock(stockId) {
        // ▼▼▼▼▼ [수정] 가상 스크롤에 맞게 수정 ▼▼▼▼▼
        // 1. 데이터에 종목이 추가되었는지 확인
        const stockIndex = this._virtualData.findIndex(s => s.id === stockId);
        if (stockIndex === -1 || !this._scrollWrapper) return;

        // 2. 해당 종목 위치로 스크롤 이동
        const scrollTop = stockIndex * ROW_PAIR_HEIGHT;
        this._scrollWrapper.scrollTo({ top: scrollTop, behavior: 'smooth' });

        // 3. 스크롤 애니메이션 후 포커스
        setTimeout(() => {
            const inputRow = this._scrollContent?.querySelector(`.virtual-row-inputs[data-id="${stockId}"]`);
            if (!inputRow) return;
            const nameInput = inputRow.querySelector('input[data-field="name"]');
            if (nameInput instanceof HTMLInputElement) {
                nameInput.focus();
                nameInput.select();
            }
        }, 300); // 스크롤 시간 고려
        // ▲▲▲▲▲ [수정] ▲▲▲▲▲
    },

    toggleFetchButton(loading) {
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
}; // End of PortfolioView object
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
        } else if (error.name === 'QuotaExceededError') { // LocalStorage quota exceeded
            userMessage = t('validation.saveErrorQuota');
        } else if (error.name === 'SecurityError') { // LocalStorage access denied
            userMessage = t('validation.saveErrorSecurity');
        } else if (error.name === 'DecimalError') { // Decimal.js 관련 오류
            userMessage = t('validation.calcErrorDecimal');
        } else if (error.message.includes("structure")) { // 파일 구조 관련 오류 (import 시)
            userMessage = t('validation.invalidFileStructure');
        } else if (context.includes('save') || context.includes('Save')) { // 저장 관련 컨텍스트
            userMessage = t('validation.saveErrorGeneral');
        }

        // 사용자에게 토스트 메시지 표시
        PortfolioView.showToast(userMessage, 'error');
    }
};
```

---

## `js/controller.js`

```javascript
// js/controller.js (async/await + DOMPurify 적용)
// @ts-check
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Calculator } from './calculator.js';
import { Validator } from './validator.js';
import { debounce, formatCurrency, getRatioSum } from './utils.js';
import { CONFIG } from './constants.js';
import { ErrorService, ValidationError } from './errorService.js';
import { t } from './i18n.js';
import { generateSectorAnalysisHTML, generateAddModeResultsHTML, generateSellModeResultsHTML, generateSimpleModeResultsHTML } from './templates.js';
import Decimal from 'decimal.js';
import { apiService } from './apiService.js';
import { AddRebalanceStrategy, SellRebalanceStrategy, SimpleRatioStrategy } from './calculationStrategies.js';
import DOMPurify from 'dompurify'; // ▼▼▼ [신규] DOMPurify 임포트 ▼▼▼
import Chart from 'chart.js/auto'; // ▼▼▼ [추가] Chart.js 임포트 ▼▼▼

// ▼▼▼ [추가] eventBinder.js 임포트 ▼▼▼
import { bindEventListeners } from './eventBinder.js';
// ▲▲▲ [추가] ▲▲▲

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
        this.debouncedSave = debounce(() => this.state.saveActivePortfolio(), 500);
        this.initialize();
    }

    async initialize() {
        await this.state.ensureInitialized();
        this.view.cacheDomElements();
        this.setupInitialUI();
        this.bindControllerEvents();

        // ▼▼▼ [추가] 실제 DOM 이벤트 바인딩 호출 ▼▼▼
        bindEventListeners(this.view);
        // ▲▲▲ [추가] ▲▲▲
    }

    setupInitialUI() {
        if (localStorage.getItem(CONFIG.DARK_MODE_KEY) === 'true') {
            document.body.classList.add('dark-mode');
        }

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

            this.fullRender();
        }
    }

    bindControllerEvents() {
        // Pub/Sub 패턴: View가 발행(emit)한 이벤트를 Controller가 구독(on)합니다.
        
        // 포트폴리오 관리
        this.view.on('newPortfolioClicked', () => this.handleNewPortfolio());
        this.view.on('renamePortfolioClicked', () => this.handleRenamePortfolio());
        this.view.on('deletePortfolioClicked', () => this.handleDeletePortfolio());
        this.view.on('portfolioSwitched', (data) => this.handleSwitchPortfolio(data.newId));

        // 포트폴리오 설정
        this.view.on('addNewStockClicked', () => this.handleAddNewStock());
        this.view.on('resetDataClicked', () => this.handleResetData());
        this.view.on('normalizeRatiosClicked', () => this.handleNormalizeRatios());
        this.view.on('fetchAllPricesClicked', () => this.handleFetchAllPrices());

        // 데이터 관리
        this.view.on('exportDataClicked', () => this.handleExportData());
        this.view.on('importDataClicked', () => this.handleImportData());
        this.view.on('fileSelected', (e) => this.handleFileSelected(e));

        // 테이블 상호작용
        this.view.on('portfolioBodyChanged', (e) => this.handlePortfolioBodyChange(e, null));
        this.view.on('portfolioBodyClicked', (e) => this.handlePortfolioBodyClick(e));
        this.view.on('manageStockClicked', (data) => this.openTransactionModalByStockId(data.stockId));
        this.view.on('deleteStockShortcut', (data) => this.handleDeleteStock(data.stockId));


        // 계산 및 통화
        this.view.on('calculateClicked', () => this.handleCalculate());
        this.view.on('mainModeChanged', (data) => this.handleMainModeChange(data.mode));
        this.view.on('currencyModeChanged', (data) => this.handleCurrencyModeChange(data.currency));
        this.view.on('currencyConversion', (data) => this.handleCurrencyConversion(data.source));
        this.view.on('portfolioExchangeRateChanged', (data) => this.handlePortfolioExchangeRateChange(data.rate));

        // 모달 상호작용
        this.view.on('closeTransactionModalClicked', () => this.view.closeTransactionModal());
        this.view.on('newTransactionSubmitted', (e) => this.handleAddNewTransaction(e));
        this.view.on('transactionDeleteClicked', (data) => this.handleTransactionListClick(data.stockId, data.txId));
        
        // 기타
        this.view.on('darkModeToggleClicked', () => this.handleToggleDarkMode());
        this.view.on('pageUnloading', () => this.handleSaveDataOnExit());
    }

    // --- UI 렌더링 ---

    fullRender() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.renderTable(
            calculatedState.portfolioData,
            activePortfolio.settings.currentCurrency,
            activePortfolio.settings.mainMode
        );

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        this.view.updateMainModeUI(activePortfolio.settings.mainMode);

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    updateUIState() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const calculatedState = Calculator.calculatePortfolioState({
            portfolioData: activePortfolio.portfolioData,
            exchangeRate: activePortfolio.settings.exchangeRate,
            currentCurrency: activePortfolio.settings.currentCurrency
        });

        this.view.updateVirtualTableData(calculatedState.portfolioData);

        const ratioSum = getRatioSum(activePortfolio.portfolioData);
        this.view.updateRatioSum(ratioSum.toNumber());

        const sectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
        this.view.displaySectorAnalysis(generateSectorAnalysisHTML(sectorData, activePortfolio.settings.currentCurrency));

        activePortfolio.portfolioData = calculatedState.portfolioData;
        this.debouncedSave();
    }

    // --- 포트폴리오 관리 핸들러 ---
    async handleNewPortfolio() {
        let name = await this.view.showPrompt(t('modal.promptNewPortfolioNameTitle'), t('modal.promptNewPortfolioNameMsg'));
        if (name) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            name = DOMPurify.sanitize(name);
            await this.state.createNewPortfolio(name); 
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), this.state.getActivePortfolio()?.id || '');
            this.fullRender();
            this.view.showToast(t('toast.portfolioCreated', { name }), "success");
        }
     }
    async handleRenamePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        let newName = await this.view.showPrompt(t('modal.promptRenamePortfolioTitle'), t('modal.promptRenamePortfolioMsg'), activePortfolio.name);
        if (newName && newName.trim()) {
            // ▼▼▼ [수정] 입력값 소독 ▼▼▼
            newName = DOMPurify.sanitize(newName.trim());
            await this.state.renamePortfolio(activePortfolio.id, newName); 
            // ▲▲▲ [수정] ▲▲▲
            this.view.renderPortfolioSelector(this.state.getAllPortfolios(), activePortfolio.id);
            this.view.showToast(t('toast.portfolioRenamed'), "success");
        }
     }
    async handleDeletePortfolio() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        if (Object.keys(this.state.getAllPortfolios()).length <= 1) {
            this.view.showToast(t('toast.lastPortfolioDeleteError'), "error");
            return;
        }

        const confirmDelete = await this.view.showConfirm(t('modal.confirmDeletePortfolioTitle'), t('modal.confirmDeletePortfolioMsg', { name: activePortfolio.name }));
        if (confirmDelete) {
            const deletedId = activePortfolio.id;
            if (await this.state.deletePortfolio(deletedId)) { 
                const newActivePortfolio = this.state.getActivePortfolio();
                if (newActivePortfolio) {
                    this.view.renderPortfolioSelector(this.state.getAllPortfolios(), newActivePortfolio.id);
                    this.fullRender();
                    this.view.showToast(t('toast.portfolioDeleted'), "success");
                }
            }
        }
     }
    
    async handleSwitchPortfolio(newId) {
        // ▼▼▼ [수정] event.target 대신 newId를 받도록 수정 ▼▼▼
        const selector = this.view.dom.portfolioSelector;
        let targetId = newId;
        
        // newId가 없는 경우(eventBinder.js에서 직접 호출된 경우) event.target에서 값을 찾음
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
            this.fullRender();
        }
        // ▲▲▲ [수정] ▲▲▲
     }


    // --- 주식/데이터 관리 핸들러 ---
    async handleAddNewStock() {
        const newStock = await this.state.addNewStock(); 
        this.fullRender();
        if (newStock) {
             this.view.focusOnNewStock(newStock.id);
        }
     }
    async handleDeleteStock(stockId) {
        const stockName = this.state.getStockById(stockId)?.name || t('defaults.unknownStock');
        const confirmDelete = await this.view.showConfirm(
            t('modal.confirmDeleteStockTitle'),
            t('modal.confirmDeleteStockMsg', { name: stockName })
        );
        if (confirmDelete) {
            if(await this.state.deleteStock(stockId)){ 
                Calculator.clearPortfolioStateCache();
                this.fullRender();
                this.view.showToast(t('toast.transactionDeleted'), "success"); 
            } else {
                 this.view.showToast(t('toast.lastStockDeleteError'), "error");
            }
        }
     }
    async handleResetData() {
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
            this.fullRender();
            this.view.showToast(t('toast.dataReset'), "success");
        }
     }
    handleNormalizeRatios() {
        try {
            const success = this.state.normalizeRatios();
            if (!success) {
                this.view.showToast(t('toast.noRatiosToNormalize'), "info");
                return;
            }
            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;
            this.view.updateAllTargetRatioInputs(activePortfolio.portfolioData);
            const sum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(sum.toNumber());
            this.debouncedSave();
            this.view.showToast(t('toast.ratiosNormalized'), "success");
        } catch (error) {
             ErrorService.handle(/** @type {Error} */ (error), 'handleNormalizeRatios');
             this.view.showToast(t('toast.normalizeRatiosError'), "error");
        }
     }

    handlePortfolioBodyChange(e, _debouncedUpdate) {
        const target = /** @type {HTMLInputElement | HTMLSelectElement} */ (e.target);
        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = target.closest('div[data-id]'); 
        // ▲▲▲ [수정] ▲▲▲
        if (!row) return;

        const stockId = row.dataset.id;
        const field = target.dataset.field;
        if (!stockId || !field) return;

        let value = (target.type === 'checkbox' && target instanceof HTMLInputElement) ? target.checked : target.value;
        let isValid = true;

        switch (field) {
            case 'targetRatio':
            case 'currentPrice':
            case 'fixedBuyAmount':
            case 'manualAmount':
                const validationResult = Validator.validateNumericInput(value);
                isValid = validationResult.isValid;
                if(isValid) value = validationResult.value ?? 0;
                break;
            case 'isFixedBuyEnabled':
                value = Boolean(value);
                break;
            // ▼▼▼ [수정] 문자열 입력 소독 ▼▼▼
            case 'sector':
            case 'name':
            case 'ticker':
            default:
                value = DOMPurify.sanitize(String(value).trim()); // 소독 추가
                break;
            // ▲▲▲ [수정] ▲▲▲
        }

        this.view.toggleInputValidation(target, isValid);

        if (isValid) {
            this.state.updateStockProperty(stockId, field, value);

            // manualAmount는 간단 모드 전용 필드로, 입력 시 테이블 재렌더링 불필요
            if (field === 'manualAmount') {
                // 하지만 _virtualData는 업데이트하여 스크롤 시 값이 유지되도록 함
                this.view.updateStockInVirtualData(stockId, field, value);
                this.debouncedSave();
                return; // 재렌더링 건너뛰기
            }

            Calculator.clearPortfolioStateCache();

            const activePortfolio = this.state.getActivePortfolio();
            if (!activePortfolio) return;

            const calculatedState = Calculator.calculatePortfolioState({
                portfolioData: activePortfolio.portfolioData,
                exchangeRate: activePortfolio.settings.exchangeRate,
                currentCurrency: activePortfolio.settings.currentCurrency
            });
            activePortfolio.portfolioData = calculatedState.portfolioData;

            this.view.updateVirtualTableData(calculatedState.portfolioData);

            const newRatioSum = getRatioSum(activePortfolio.portfolioData);
            this.view.updateRatioSum(newRatioSum.toNumber());

            const newSectorData = Calculator.calculateSectorAnalysis(calculatedState.portfolioData);
            this.view.displaySectorAnalysis(generateSectorAnalysisHTML(newSectorData, activePortfolio.settings.currentCurrency));

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
     }


    handlePortfolioBodyClick(e) {
        const target = /** @type {HTMLElement} */ (e.target);
        const actionButton = target.closest('button[data-action]');
        if (!actionButton) return;
        
        // ▼▼▼ [수정] 'tr' -> 'div[data-id]' ▼▼▼
        const row = actionButton.closest('div[data-id]'); 
        // ▲▲▲ [수정] ▲▲▲
        if (!row?.dataset.id) return;

        const stockId = row.dataset.id;
        const action = actionButton.dataset.action;

        if (action === 'manage') {
            this.openTransactionModalByStockId(stockId);
        } else if (action === 'delete') {
            this.handleDeleteStock(stockId);
        }
     }
     
    openTransactionModalByStockId(stockId) {
        const stock = this.state.getStockById(stockId);
        const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
        if (stock && currency) {
            this.view.openTransactionModal(stock, currency, this.state.getTransactions(stockId));
        }
    }


    // --- 계산 및 통화 핸들러 ---
    async handleCalculate() {
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
            const errorMessages = validationErrors.map(err => err.message).join('\n');
            ErrorService.handle(new ValidationError(errorMessages), 'handleCalculate - Validation');
            this.view.hideResults();
            return;
        }

        // 목표 비율 검증 (모든 모드에서 수행)
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

        // ▼▼▼ [수정] 전략 패턴 적용 ▼▼▼
        let strategy;
        if (activePortfolio.settings.mainMode === 'add') {
            strategy = new AddRebalanceStrategy(calculatedState.portfolioData, additionalInvestment);
        } else if (activePortfolio.settings.mainMode === 'simple') {
            strategy = new SimpleRatioStrategy(calculatedState.portfolioData, additionalInvestment);
        } else {
            strategy = new SellRebalanceStrategy(calculatedState.portfolioData);
        }
        const rebalancingResults = Calculator.calculateRebalancing(strategy);
        // ▲▲▲ [수정] ▲▲▲

        const resultsHTML = activePortfolio.settings.mainMode === 'add'
             ? generateAddModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : activePortfolio.settings.mainMode === 'simple'
             ? generateSimpleModeResultsHTML(rebalancingResults.results, {
                   currentTotal: calculatedState.currentTotal,
                   additionalInvestment: additionalInvestment,
                   finalTotal: calculatedState.currentTotal.plus(additionalInvestment)
               }, activePortfolio.settings.currentCurrency)
             : generateSellModeResultsHTML(rebalancingResults.results, activePortfolio.settings.currentCurrency);

        this.view.displayResults(resultsHTML);

        // ▼▼▼ [추가] 차트 표시 ▼▼▼
        const chartLabels = rebalancingResults.results.map(r => r.stock.name);
        const chartData = rebalancingResults.results.map(r => {
            const ratio = r.stock.targetRatio instanceof Decimal ? r.stock.targetRatio : new Decimal(r.stock.targetRatio ?? 0);
            return ratio.toNumber();
        });
        const chartTitle = activePortfolio.settings.mainMode === 'simple'
            ? '포트폴리오 목표 비율 (간단 계산 모드)'
            : activePortfolio.settings.mainMode === 'add'
            ? '포트폴리오 목표 비율 (추가 매수 모드)'
            : '포트폴리오 목표 비율 (매도 리밸런싱 모드)';
        this.view.displayChart(Chart, chartLabels, chartData, chartTitle);
        // ▲▲▲ [추가] ▲▲▲

        this.debouncedSave();
        this.view.showToast(t('toast.calculateSuccess'), "success");
     }


    async handleFetchAllPrices() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio || activePortfolio.portfolioData.length === 0) {
            this.view.showToast(t('api.noUpdates'), "info");
            return;
        }

        const tickersToFetch = activePortfolio.portfolioData
            .filter(s => s.ticker && s.ticker.trim() !== '')
            .map(s => ({ id: s.id, ticker: s.ticker.trim() }));

        if (tickersToFetch.length === 0) {
            this.view.showToast(t('toast.noTickersToFetch'), "info");
            return;
        }

        this.view.toggleFetchButton(true);

        try {
            let successCount = 0;
            let failureCount = 0;
            const failedTickers = [];

            const results = await apiService.fetchAllStockPrices(tickersToFetch);

            // Get current currency and exchange rate for conversion
            const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;
            const currentCurrency = activePortfolio.currentCurrency || 'krw';

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value) {
                    let price = result.value; // This is in USD from Finnhub API

                    // Convert USD price to KRW if current currency is KRW
                    if (currentCurrency === 'krw') {
                        price = price * exchangeRate;
                    }

                    this.state.updateStockProperty(result.id, 'currentPrice', price);
                    this.view.updateCurrentPriceInput(result.id, price.toFixed(2));
                    successCount++;
                } else {
                    failureCount++;
                    failedTickers.push(result.ticker);
                    console.error(`[API] Failed to fetch price for ${result.ticker}:`, result.reason);
                }
            });

            Calculator.clearPortfolioStateCache();
            this.updateUIState(); 

            if (successCount === tickersToFetch.length) {
                this.view.showToast(t('api.fetchSuccessAll', { count: successCount }), "success");
            } else if (successCount > 0) {
                this.view.showToast(t('api.fetchSuccessPartial', { count: successCount, failed: failureCount }), "warning");
            } else {
                this.view.showToast(t('api.fetchFailedAll', { failed: failureCount }), "error");
            }
            if (failedTickers.length > 0) {
                console.log("Failed tickers:", failedTickers.join(', '));
            }
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleFetchAllPrices');
            this.view.showToast(t('api.fetchErrorGlobal', { message: error.message }), 'error');
        } finally {
            this.view.toggleFetchButton(false);
        }
     }

    async handleMainModeChange(newMode) {
        if (newMode !== 'add' && newMode !== 'sell' && newMode !== 'simple') return;
        await this.state.updatePortfolioSettings('mainMode', newMode);
        this.fullRender();
        const modeName = newMode === 'add' ? t('ui.addMode') : newMode === 'simple' ? '간단 계산 모드' : t('ui.sellMode');
        this.view.showToast(t('toast.modeChanged', { mode: modeName }), "info");
     }

    async handleCurrencyModeChange(newCurrency) {
        if (newCurrency !== 'krw' && newCurrency !== 'usd') return;

        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const oldCurrency = activePortfolio.currentCurrency || 'krw';

        // If currency is actually changing, convert all existing currentPrice values
        if (oldCurrency !== newCurrency) {
            const exchangeRate = activePortfolio.settings.exchangeRate || CONFIG.DEFAULT_EXCHANGE_RATE;

            activePortfolio.portfolioData.forEach(stock => {
                if (stock.currentPrice && stock.currentPrice > 0) {
                    let newPrice = stock.currentPrice;

                    // Convert from old currency to new currency
                    if (oldCurrency === 'usd' && newCurrency === 'krw') {
                        // USD to KRW
                        newPrice = stock.currentPrice * exchangeRate;
                    } else if (oldCurrency === 'krw' && newCurrency === 'usd') {
                        // KRW to USD
                        newPrice = stock.currentPrice / exchangeRate;
                    }

                    this.state.updateStockProperty(stock.id, 'currentPrice', newPrice);
                }
            });
        }

        await this.state.updatePortfolioSettings('currentCurrency', newCurrency);
        this.fullRender();
        this.view.showToast(t('toast.currencyChanged', { currency: newCurrency.toUpperCase() }), "info");
    }

    async handleCurrencyConversion(source) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;

         if (!(additionalAmountInput instanceof HTMLInputElement) || !(additionalAmountUSDInput instanceof HTMLInputElement) || !(exchangeRateInput instanceof HTMLInputElement)) return;

        const exchangeRateNum = Number(exchangeRateInput.value) || CONFIG.DEFAULT_EXCHANGE_RATE;
        const isValidRate = exchangeRateNum > 0;
        let currentExchangeRate = CONFIG.DEFAULT_EXCHANGE_RATE;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum); 
            currentExchangeRate = exchangeRateNum;
        } else {
             await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE); 
             exchangeRateInput.value = CONFIG.DEFAULT_EXCHANGE_RATE.toString();
             this.view.showToast(t('toast.invalidExchangeRate'), "error");
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

        } catch(e) {
             console.error("Error during currency conversion:", e);
             this.view.showToast(t('toast.amountInputError'), "error");
             if (source === 'krw') additionalAmountUSDInput.value = ''; else additionalAmountInput.value = '';
        }
     }

    async handlePortfolioExchangeRateChange(rate) {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return;

        const exchangeRateNum = Number(rate);
        const isValidRate = !isNaN(exchangeRateNum) && exchangeRateNum > 0;

        if (isValidRate) {
            await this.state.updatePortfolioSettings('exchangeRate', exchangeRateNum);
            this.debouncedSave();
        } else {
            await this.state.updatePortfolioSettings('exchangeRate', CONFIG.DEFAULT_EXCHANGE_RATE);
            this.view.showToast(t('toast.invalidExchangeRate'), "error");
        }
    }


    // --- 거래 내역 모달 핸들러 ---

    async handleAddNewTransaction(e) {
        e.preventDefault();
        const form = /** @type {HTMLFormElement} */ (e.target);
        const modal = form.closest('#transactionModal');
        const stockId = modal?.dataset.stockId;
        if (!stockId) return;

        const typeInput = form.querySelector('input[name="txType"]:checked');
        const inputModeInput = form.querySelector('input[name="inputMode"]:checked');
        const dateInput = /** @type {HTMLInputElement} */ (form.querySelector('#txDate'));
        const quantityInput = /** @type {HTMLInputElement} */ (form.querySelector('#txQuantity'));
        const totalAmountInput = /** @type {HTMLInputElement} */ (form.querySelector('#txTotalAmount'));
        const priceInput = /** @type {HTMLInputElement} */ (form.querySelector('#txPrice'));

        if (!typeInput || !dateInput || !priceInput) return;

        const type = (typeInput instanceof HTMLInputElement && typeInput.value === 'sell') ? 'sell' : 'buy';
        const inputMode = (inputModeInput instanceof HTMLInputElement) ? inputModeInput.value : 'quantity';
        const date = dateInput.value;
        const priceStr = priceInput.value;

        let finalQuantity;

        if (inputMode === 'amount') {
            // 금액 입력 모드: 총 금액 / 단가 = 수량 (Decimal.js로 정밀 계산)
            if (!totalAmountInput || !totalAmountInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), "error");
                return;
            }

            const totalAmountStr = totalAmountInput.value;

            try {
                const totalAmountDec = new Decimal(totalAmountStr);
                const priceDec = new Decimal(priceStr);

                if (priceDec.isZero() || priceDec.isNegative()) {
                    this.view.showToast('단가는 0보다 커야 합니다.', "error");
                    return;
                }

                // 수량 = 총 금액 / 단가
                const quantityDec = totalAmountDec.div(priceDec);
                finalQuantity = quantityDec.toNumber();
            } catch (error) {
                this.view.showToast('금액 또는 단가 입력이 올바르지 않습니다.', "error");
                return;
            }
        } else {
            // 수량 입력 모드: 기존 방식
            if (!quantityInput || !quantityInput.value) {
                this.view.showToast(t('toast.invalidTransactionInfo'), "error");
                return;
            }

            const quantityStr = quantityInput.value;
            finalQuantity = Number(quantityStr);
        }

        const txData = { type, date, quantity: String(finalQuantity), price: priceStr };
        const validationResult = Validator.validateTransaction(txData);

        if (!validationResult.isValid) {
            this.view.showToast(validationResult.message || t('toast.invalidTransactionInfo'), "error");
            return;
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
                // UI 토글
                const quantityInputGroup = document.getElementById('quantityInputGroup');
                const totalAmountInputGroup = document.getElementById('totalAmountInputGroup');
                const calculatedQuantityDisplay = document.getElementById('calculatedQuantityDisplay');

                if (quantityInputGroup) quantityInputGroup.style.display = '';
                if (totalAmountInputGroup) totalAmountInputGroup.style.display = 'none';
                if (calculatedQuantityDisplay) calculatedQuantityDisplay.style.display = 'none';
                if (quantityInput) quantityInput.required = true;
                if (totalAmountInput) totalAmountInput.required = false;
            }

            this.view.showToast(t('toast.transactionAdded'), "success");

            Calculator.clearPortfolioStateCache();
            this.fullRender();
        } else {
             this.view.showToast(t('toast.transactionAddFailed'), "error");
        }
     }


    async handleTransactionListClick(stockId, txId) {
        if (stockId && txId) {
             const confirmDelete = await this.view.showConfirm(t('modal.confirmDeleteTransactionTitle'), t('modal.confirmDeleteTransactionMsg'));
             if(confirmDelete) {
                 const success = await this.state.deleteTransaction(stockId, txId); 
                 if (success) {
                    const currency = this.state.getActivePortfolio()?.settings.currentCurrency;
                    if (currency) {
                         const transactionsBeforeRender = this.state.getTransactions(stockId);
                         this.view.renderTransactionList(transactionsBeforeRender, currency);
                    }
                    this.view.showToast(t('toast.transactionDeleted'), "success");
                    Calculator.clearPortfolioStateCache();
                    this.updateUIState();
                 } else {
                     this.view.showToast(t('toast.transactionDeleteFailed'), "error");
                 }
            }
        } else {
             console.error("handleTransactionListClick received invalid IDs:", stockId, txId);
        }
     }


    // --- 기타 핸들러 ---
    handleToggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(CONFIG.DARK_MODE_KEY, isDarkMode ? 'true' : 'false');
        this.view.destroyChart();
        this.fullRender();
     }
    handleSaveDataOnExit() {
        console.log("Page unloading. Relaying on debounced save.");
    }
    handleImportData() {
        const fileInput = this.view.dom.importFileInput;
        if (fileInput instanceof HTMLInputElement) fileInput.click();
     }
    handleFileSelected(e) {
        const fileInput = /** @type {HTMLInputElement} */ (e.target);
        const file = fileInput.files?.[0];

        if (file) {
            if (file.type !== 'application/json') {
                this.view.showToast(t('toast.invalidFileType'), "error");
                fileInput.value = '';
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
                        this.setupInitialUI();
                        this.view.showToast(t('toast.importSuccess'), "success");
                    } else {
                         throw new Error("Failed to read file content.");
                    }
                } catch (error) {
                    ErrorService.handle(/** @type {Error} */ (error), 'handleFileSelected');
                    this.view.showToast(t('toast.importError'), "error");
                } finally {
                    fileInput.value = '';
                }
            };
             reader.onerror = () => {
                 ErrorService.handle(new Error("File reading error"), 'handleFileSelected - Reader Error');
                 this.view.showToast(t('toast.importError'), "error");
                 fileInput.value = '';
             };
            reader.readAsText(file);
        }
     }
    handleExportData() {
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
            this.view.showToast(t('toast.exportSuccess'), "success");
        } catch (error) {
            ErrorService.handle(/** @type {Error} */ (error), 'handleExportData');
            this.view.showToast(t('toast.exportError'), "error");
        }
     }

    getInvestmentAmountInKRW() {
        const activePortfolio = this.state.getActivePortfolio();
        if (!activePortfolio) return new Decimal(0);
        
        const { currentCurrency } = activePortfolio.settings;
        const { additionalAmountInput, additionalAmountUSDInput, exchangeRateInput } = this.view.dom;
        
        if (!(additionalAmountInput instanceof HTMLInputElement) || 
            !(additionalAmountUSDInput instanceof HTMLInputElement) || 
            !(exchangeRateInput instanceof HTMLInputElement)) {
            return new Decimal(0);
        }
        
        const amountKRWStr = additionalAmountInput.value || '0';
        const amountUSDStr = additionalAmountUSDInput.value || '0';
        const exchangeRateStr = exchangeRateInput.value || String(CONFIG.DEFAULT_EXCHANGE_RATE);

        try {
            const amountKRW = new Decimal(amountKRWStr);
            const amountUSD = new Decimal(amountUSDStr);
            const exchangeRate = new Decimal(exchangeRateStr);

            if (currentCurrency === 'krw') {
                return amountKRW.isNegative() ? new Decimal(0) : amountKRW;
            } else {
                 if (exchangeRate.isZero() || exchangeRate.isNegative()) return new Decimal(0);
                const calculatedKRW = amountUSD.times(exchangeRate);
                return calculatedKRW.isNegative() ? new Decimal(0) : calculatedKRW;
            }
        } catch (e) {
             console.error("Error parsing investment amount:", e);
             return new Decimal(0);
        }
     }
}
```

---

## `js/controller.test.js`

```javascript
// js/controller.test.js (Refactored for Pub/Sub, Async State, testUtils, and Mock Fixes)
// @ts-check

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Decimal from 'decimal.js';

// --- ▼▼▼ 모의(Mock) 설정 ▼▼▼ ---
vi.mock('./state.js');
vi.mock('./view.js', () => ({
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
    updateVirtualTableData: vi.fn(), // [수정] updateUIState -> updateVirtualTableData
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
    // DOM 요소 (최소한의 모의)
    dom: {
        additionalAmountInput: { value: '0' },
        additionalAmountUSDInput: { value: '0' },
        exchangeRateInput: { value: '1300' },
        importFileInput: { click: vi.fn() },
    }
  }
}));
vi.mock('./validator.js');
vi.mock('./errorService.js');
vi.mock('./calculator.js');

// ▼▼▼ [수정] 전략 클래스 모의(Mock) 방식 변경 ▼▼▼
// 1. 스파이를 모듈 최상단 스코프에 정의
const mockAddCalculate = vi.fn(() => ({ results: [] }));
const mockSellCalculate = vi.fn(() => ({ results: [] }));

// 2. vi.mock 팩토리에서 이 스파이들을 사용하는 '클래스'를 반환
vi.mock('./calculationStrategies.js', () => ({
    AddRebalanceStrategy: class { // 'new'로 호출 가능한 클래스
        constructor(...args) {
            // (선택) 생성자 인수 로깅/테스트
        }
        calculate = mockAddCalculate; // [중요] 인스턴스 메서드로 모의 함수 할당
    },
    SellRebalanceStrategy: class { // 'new'로 호출 가능한 클래스
        constructor(...args) {
            // ...
        }
        calculate = mockSellCalculate;
    },
}));
// ▲▲▲ [수정] ▲▲▲

vi.mock('./apiService.js', () => ({
    apiService: {
        fetchAllStockPrices: vi.fn()
    }
}));
vi.mock('./i18n.js', () => ({
    t: vi.fn((key) => key), // 단순 키 반환
}));
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input) => input), 
    }
}));


// --- ▼▼▼ 실제 모듈 및 모의 객체 임포트 ▼▼▼ ---
import { PortfolioController } from './controller.js';
import { PortfolioState } from './state.js';
import { PortfolioView } from './view.js';
import { Validator } from './validator.js';
import { ErrorService, ValidationError } from './errorService.js';
import { Calculator } from './calculator.js';
// [중요] 모의(mock)된 모듈을 임포트 (이때 AddRebalanceStrategy는 위에서 정의한 mock class가 됨)
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies.js'; 
import { apiService } from './apiService.js';
import { t } from './i18n.js';
import { MOCK_PORTFOLIO_1, MOCK_STOCK_1 } from './testUtils.js';


// --- 테스트 스위트 ---
describe('PortfolioController', () => {
  let controller;
  let mockState;
  let mockView;
  let mockCalculator;
  let mockValidator;
  
  let mockDefaultPortfolio;
  
  beforeEach(async () => {
    vi.clearAllMocks(); // [수정] 이 clearAllMocks가 모의된 생성자도 초기화합니다.

    // MOCK_PORTFOLIO_1의 깊은 복사본을 만들어 테스트에 사용
    mockDefaultPortfolio = JSON.parse(JSON.stringify(MOCK_PORTFOLIO_1));
    mockDefaultPortfolio.portfolioData.forEach(stock => {
        stock.targetRatio = new Decimal(stock.targetRatio);
        stock.currentPrice = new Decimal(stock.currentPrice);
        stock.fixedBuyAmount = new Decimal(stock.fixedBuyAmount);
        stock.calculated.currentAmount = new Decimal(stock.calculated.currentAmount);
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
    // ... (state 수정 메서드 모의) ...
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
      portfolioData: mockDefaultPortfolio.portfolioData,
      currentTotal: new Decimal(5500), 
      cacheKey: 'mock-key'
    });
    vi.mocked(mockCalculator.calculateSectorAnalysis).mockReturnValue([]);
    
    // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
    // 'mockReturnValue' 대신 'mockImplementation'을 사용하여
    // Calculator.calculateRebalancing이 strategy.calculate()를 호출하도록 수정
    vi.mocked(mockCalculator.calculateRebalancing).mockImplementation((strategy) => {
      // 전달받은 strategy의 calculate()를 수동으로 호출해줍니다.
      return strategy.calculate();
    });
    // ▲▲▲▲▲ [수정 완료] ▲▲▲▲▲

    // 4. [삭제] 오류를 유발하는 mockClear 블록 삭제

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
    vi.mocked(mockValidator.validateForCalculation).mockReturnValue([{ field: null, stockId: null, message: '- 테스트 오류' }]);

    await controller.handleCalculate();

    expect(mockValidator.validateForCalculation).toHaveBeenCalledOnce();
    expect(mockView.hideResults).toHaveBeenCalledOnce();
    expect(ErrorService.handle).toHaveBeenCalledWith(expect.any(ValidationError), 'handleCalculate - Validation');
    expect(mockCalculator.calculateRebalancing).not.toHaveBeenCalled();
  });
  
  it('handleCalculate: 목표 비율 100% 미만 시 확인 창을 띄우고, 취소 시 중단해야 한다', async () => {
     vi.mocked(mockValidator.validateForCalculation).mockReturnValue([]);
     const portfolioWithBadRatio = {
         ...mockDefaultPortfolio,
         portfolioData: [
             {...mockDefaultPortfolio.portfolioData[0], targetRatio: new Decimal(30)}, // 합 30
             {...mockDefaultPortfolio.portfolioData[1], targetRatio: new Decimal(0)}
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
    // MOCK_PORTFOLIO_1의 합계는 100% (50+50)
    vi.mocked(mockState.getActivePortfolio).mockReturnValue(mockDefaultPortfolio);
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);

    await controller.handleCalculate();

    // ▼▼▼ [수정] 모의 생성자(vi.fn) 대신, 인스턴스의 calculate 메서드(vi.fn)를 검사 ▼▼▼
    expect(mockAddCalculate).toHaveBeenCalledOnce();
    expect(mockSellCalculate).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲
    
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    // [수정] 'new'로 생성된 실제 클래스 인스턴스를 검사
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

    // ▼▼▼ [수정] 모의 생성자(vi.fn) 대신, 인스턴스의 calculate 메서드(vi.fn)를 검사 ▼▼▼
    expect(mockSellCalculate).toHaveBeenCalledOnce();
    expect(mockAddCalculate).not.toHaveBeenCalled();
    // ▲▲▲ [수정] ▲▲▲

    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledOnce();
    expect(mockCalculator.calculateRebalancing).toHaveBeenCalledWith(expect.any(SellRebalanceStrategy));
    expect(mockView.displayResults).toHaveBeenCalledOnce();
  });
  
  it('handleFetchAllPrices: API 호출 성공 시 state와 view를 업데이트해야 한다', async () => {
    const mockApiResponse = [
      { id: 's1', ticker: 'AAA', status: 'fulfilled', value: 150 },
      { id: 's2', ticker: 'BBB', status: 'fulfilled', value: 210 }
    ];
    vi.mocked(apiService.fetchAllStockPrices).mockResolvedValue(mockApiResponse);

    await controller.handleFetchAllPrices();

    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(true);
    expect(apiService.fetchAllStockPrices).toHaveBeenCalledWith([{ id: 's1', ticker: 'AAA' }, { id: 's2', ticker: 'BBB' }]);
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s1', 'currentPrice', 150);
    expect(mockState.updateStockProperty).toHaveBeenCalledWith('s2', 'currentPrice', 210);
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s1', '150.00');
    expect(mockView.updateCurrentPriceInput).toHaveBeenCalledWith('s2', '210.00');
    
    // ▼▼▼ [수정] "is not a spy" 오류 수정 ▼▼▼
    // 'controller.updateUIState'가 'view.updateVirtualTableData'를 호출했는지 확인
    expect(mockView.updateVirtualTableData).toHaveBeenCalledOnce(); 
    // ▲▲▲ [수정] ▲▲▲
    
    expect(mockView.showToast).toHaveBeenCalledWith('api.fetchSuccessAll', "success");
    expect(mockView.toggleFetchButton).toHaveBeenCalledWith(false);
  });
  
  it('handleTransactionListClick: 거래 삭제 시 state.deleteTransaction을 호출해야 한다 (async)', async () => {
    vi.mocked(mockView.showConfirm).mockResolvedValue(true);
    
    await controller.handleTransactionListClick('s1', 'tx1');
    
    expect(mockView.showConfirm).toHaveBeenCalledOnce();
    expect(mockState.deleteTransaction).toHaveBeenCalledWith('s1', 'tx1');
    expect(mockView.renderTransactionList).toHaveBeenCalledOnce();
    expect(mockView.showToast).toHaveBeenCalledWith('toast.transactionDeleted', 'success');

    // ▼▼▼ [수정] "is not a spy" 오류 수정 ▼▼▼
    expect(mockView.updateVirtualTableData).toHaveBeenCalledOnce();
    // ▲▲▲ [수정] ▲▲▲
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

## `js/calculator.test.js`

```javascript
// js/calculator.test.js (전략 패턴 적용)
// @ts-check

import { describe, it, expect, vi } from 'vitest';
import Decimal from 'decimal.js';
import { Calculator } from './calculator.js';
import { AddRebalanceStrategy, SellRebalanceStrategy } from './calculationStrategies.js';
import { createMockCalculatedStock } from './testUtils.js';

describe('Calculator.calculateStockMetrics (동기)', () => {
    it('매수 거래만 있을 때 정확한 평단가와 수량을 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 150,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 }, 
                { id:'t2', type: 'buy', date: '2023-01-02', quantity: 10, price: 120 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
        // @ts-ignore
        const result = Calculator.calculateStockMetrics(stock);
        expect(result.quantity.toString()).toBe('20');
        expect(result.avgBuyPrice.toString()).toBe('110');
        expect(result.currentAmount.toString()).toBe('3000'); 
        expect(result.profitLoss.toString()).toBe('800'); 
    });

    it('매수와 매도 거래가 섞여 있을 때 정확한 상태를 계산해야 한다', () => {
        const stock = {
            id: 's1', name: 'Test', ticker: 'TEST', sector: 'Tech', targetRatio: 100, currentPrice: 200,
            transactions: [
                { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                { id:'t2', type: 'sell', date: '2023-01-02', quantity: 5, price: 150 },
            ], isFixedBuyEnabled: false, fixedBuyAmount: 0
        };
         // @ts-ignore
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
             const stock = {
                id: 's1', name: 'OverSell', ticker: 'OVER', sector: '', targetRatio: 100, currentPrice: 100,
                transactions: [
                    { id:'t1', type: 'buy', date: '2023-01-01', quantity: 10, price: 100 },
                    { id:'t2', type: 'sell', date: '2023-01-02', quantity: 15, price: 80 }
                ], isFixedBuyEnabled: false, fixedBuyAmount: 0
            };
            // @ts-ignore
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
                // @ts-ignore
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

## `js/validator.test.js`

```javascript
// js/validator.test.js
import { describe, it, expect, vi } from 'vitest';
import { Validator } from './validator.js';
import Decimal from 'decimal.js'; // Import Decimal for validateForCalculation test
import { CONFIG } from './constants.js'; // Import CONFIG for data structure test

// --- ⬇️ Mock i18n BEFORE importing validator.js ⬇️ ---
vi.mock('./i18n.js', () => ({
  t: vi.fn((key, replacements) => { // Added replacements parameter
    // Provide Korean messages needed for the tests
    if (key === 'validation.negativeNumber') return '음수는 입력할 수 없습니다.';
    if (key === 'validation.invalidNumber') return '유효한 숫자가 아닙니다.';
    if (key === 'validation.futureDate') return '미래 날짜는 입력할 수 없습니다.';
    if (key === 'validation.quantityZero') return '수량은 0보다 커야 합니다.';
    if (key === 'validation.priceZero') return '단가는 0보다 커야 합니다.';
    if (key === 'validation.invalidDate') return '유효한 날짜를 입력해주세요.';
    // Add messages for validateForCalculation
    if (key === 'validation.investmentAmountZero') return '- 추가 투자 금액을 0보다 크게 입력해주세요.';
    if (key === 'validation.currentPriceZero') return `- '${replacements?.name}'의 현재가는 0보다 커야 합니다.`; // Include replacement
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
        expect(Validator.validateNumericInput(-10)).toEqual({ isValid: false, message: '음수는 입력할 수 없습니다.' }); // Matches mocked 't'
    });

    it('숫자가 아닌 문자열을 유효하지 않다고 처리해야 합니다.', () => {
        expect(Validator.validateNumericInput('abc')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' }); // Matches mocked 't'
        // --- ⬇️ Updated Expectation for empty string (assuming validator.js is fixed) ⬇️ ---
        expect(Validator.validateNumericInput('')).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' }); // Empty string test
        // --- ⬆️ Updated Expectation ⬆️ ---
        expect(Validator.validateNumericInput(null)).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });
        expect(Validator.validateNumericInput(undefined)).toEqual({ isValid: false, message: '유효한 숫자가 아닙니다.' });

    });
});

describe('Validator.validateTransaction', () => {
   const validTx = { type: 'buy', date: '2023-10-26', quantity: 10, price: 50 }; // Added type

   it('유효한 거래 데이터를 통과시켜야 합니다.', () => {
     expect(Validator.validateTransaction(validTx).isValid).toBe(true);
   });

   it('미래 날짜를 거부해야 합니다.', () => {
     const futureDate = new Date();
     futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
     const futureTx = { ...validTx, date: futureDate.toISOString().slice(0, 10)};
     expect(Validator.validateTransaction(futureTx).isValid).toBe(false);
     expect(Validator.validateTransaction(futureTx).message).toBe('미래 날짜는 입력할 수 없습니다.'); // Matches mocked 't'
   });

   it('잘못된 날짜 형식을 거부해야 합니다.', () => {
       const invalidDateTx = { ...validTx, date: 'invalid-date' };
       expect(Validator.validateTransaction(invalidDateTx).isValid).toBe(false);
       expect(Validator.validateTransaction(invalidDateTx).message).toBe('유효한 날짜를 입력해주세요.'); // Matches mocked 't'
   });

   it('수량이 0이거나 음수일 때 거부해야 합니다.', () => {
       const zeroQtyTx = { ...validTx, quantity: 0 };
       const negQtyTx = { ...validTx, quantity: -5 };
       expect(Validator.validateTransaction(zeroQtyTx).isValid).toBe(false);
       expect(Validator.validateTransaction(zeroQtyTx).message).toBe('수량은 0보다 커야 합니다.'); // Matches mocked 't'
       expect(Validator.validateTransaction(negQtyTx).isValid).toBe(false);
       // --- ⬇️ Updated Expectation for negative number ⬇️ ---
       expect(Validator.validateTransaction(negQtyTx).message).toBe('음수는 입력할 수 없습니다.'); // Expect negative number message
       // --- ⬆️ Updated Expectation ⬆️ ---
   });

   it('단가가 0이거나 음수일 때 거부해야 합니다.', () => {
       const zeroPriceTx = { ...validTx, price: 0 };
       const negPriceTx = { ...validTx, price: -50 };
       expect(Validator.validateTransaction(zeroPriceTx).isValid).toBe(false);
       expect(Validator.validateTransaction(zeroPriceTx).message).toBe('단가는 0보다 커야 합니다.'); // Matches mocked 't'
       expect(Validator.validateTransaction(negPriceTx).isValid).toBe(false);
       // --- ⬇️ Updated Expectation for negative number ⬇️ ---
       expect(Validator.validateTransaction(negPriceTx).message).toBe('음수는 입력할 수 없습니다.'); // Expect negative number message
       // --- ⬆️ Updated Expectation ⬆️ ---
   });

});


describe('Validator.validateForCalculation', () => {
    // --- ⬇️ Updated test data with calculated.quantity ⬇️ ---
    const validPortfolioData = [
        { id: 's1', name: 'Stock A', ticker: 'AAA', sector: 'Tech', targetRatio: 50, currentPrice: 100, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(1000), quantity: new Decimal(10) } }, // Added quantity
        { id: 's2', name: 'Stock B', ticker: 'BBB', sector: 'Finance', targetRatio: 50, currentPrice: 200, isFixedBuyEnabled: false, fixedBuyAmount: 0, transactions: [], calculated: { currentAmount: new Decimal(2000), quantity: new Decimal(10) } }, // Added quantity
    ];
    // --- ⬆️ Updated test data ⬆️ ---

    it('유효한 추가 매수 입력값을 통과시켜야 합니다.', () => {
        const inputs = {
            mainMode: 'add',
            portfolioData: validPortfolioData,
            additionalInvestment: new Decimal(500)
        };
        expect(Validator.validateForCalculation(inputs)).toEqual([]);
    });

     it('추가 매수 모드에서 추가 투자금이 0 이하일 때 오류를 반환해야 합니다.', () => {
         const inputs = {
             mainMode: 'add',
             portfolioData: validPortfolioData,
             additionalInvestment: new Decimal(0)
         };
         const errors = Validator.validateForCalculation(inputs);
         expect(errors.length).toBeGreaterThan(0);
         // Check for the specific message using the mocked 't' function
         expect(errors.some(e => e.message === '- 추가 투자 금액을 0보다 크게 입력해주세요.')).toBe(true);
     });

    // Add more tests...
    it('현재가가 0 이하인 주식이 있을 때 오류를 반환해야 합니다.', () => {
        const portfolioWithZeroPrice = [
             { ...validPortfolioData[0] },
             { ...validPortfolioData[1], currentPrice: 0, calculated: { currentAmount: new Decimal(0), quantity: new Decimal(10)} } // Set price to 0
        ];
         const inputs = {
             mainMode: 'add',
             portfolioData: portfolioWithZeroPrice,
             additionalInvestment: new Decimal(500)
         };
         const errors = Validator.validateForCalculation(inputs);
         expect(errors.length).toBeGreaterThan(0);
         expect(errors.some(e => e.stockId === 's2' && e.message.includes('현재가는 0보다 커야 합니다.'))).toBe(true); // Check specific error
     });

});


describe('Validator.isDataStructureValid', () => {
    it('유효한 데이터 구조를 통과시켜야 합니다.', () => {
        const validData = {
            meta: { activePortfolioId: 'p1', version: CONFIG.DATA_VERSION }, // Use CONFIG version
            portfolios: {
                'p1': {
                    id: 'p1', name: 'Valid',
                    // --- ⬇️ Added required settings properties ⬇️ ---
                    settings: {
                         mainMode: 'add',
                         currentCurrency: 'krw',
                         exchangeRate: 1300
                    },
                    // --- ⬆️ Added required settings properties ⬆️ ---
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
                  'p1': { id: 'p1' /* Missing name, settings, portfolioData */ }
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