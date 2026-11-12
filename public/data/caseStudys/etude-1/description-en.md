# Case study: PHP performance optimization in a critical environment
<tags>
    <tag label="PHP"></tag>
    <tag label="Diagnosis"></tag>
    <tag label="Benchmarks"></tag>
    <tag label="Action plan"></tag>
    <tag label="Internal business applications"></tag>
</tags>

*Software engineering case study* \
**Modernization and performance optimization of a PHP application estate within a large public administration**

## Executive summary: key takeaways

**The challenge:** Within an IT services center of a large public administration, several internal business applications developed in PHP without a framework process large volumes of data. Subject to strict security rules (hardened software versions, sovereign private OpenStack cloud, GDPR compliance), these legacy applications require modernization to guarantee a smooth user experience when loading pages or importing large CSV files.

**The approach and results:** Through a quantified comparative study and an audit of the existing estate (notably a business data management application), this work demonstrates that a combination of targeted actions (upgrading to PHP 8, enabling OPcache, eliminating silent warnings, RAM caching via Redis, server-side pagination and delegating heavy computations to C/Rust) can divide processing times by a factor ranging from 3.8 to more than 100, while controlling infrastructure costs.

## 1. Business context and project origins

The host organization is a large French public administration managing a vast and complex information system. While the historical core relies on central systems (COBOL), an ecosystem of PHP web applications has developed over the years to quickly meet agents' operational needs.

**A natural evolution:** Initially, many tools were created locally to automate daily tasks and respond to business emergencies. Given their effectiveness, these tools were widely adopted by departments. Today, to guarantee their sustainability, security and performance, these applications have been centralized and entrusted to the IT center's development teams for maintenance and modernization.

**Problem statement:** How can the performance of these existing PHP applications be sustainably optimized to guarantee a smooth user experience, while respecting the technical, security and budgetary constraints specific to the public sector?

## 2. A highly constrained technical environment

Unlike a classic web project, optimization within a public administration cannot rely on public cloud services or on the free addition of third-party libraries. Field analysis highlights five structuring constraints:

1. Heterogeneity of the estate: maintained applications cover a spectrum ranging from PHP 4 and PHP 5 (legacy heritage) to PHP 8.3 for recent projects, backed mainly by PostgreSQL (as well as MariaDB and Oracle on former scopes).
2. Prohibition of external frameworks: to keep total control of the code and the attack surface, the use of frameworks such as Symfony or Laravel is prohibited. Development is done in "pure PHP", with limited use of AJAX.
3. Hardened software foundations: the administration maintains its own internal repositories. The PHP and PostgreSQL engines are modified internally to disable functions deemed risky and strengthen security controls.
4. Sovereign OpenStack infrastructure: due to confidentiality and GDPR/CNIL compliance requirements, hosting relies on an internal private cloud (OpenStack) and dedicated servers, with finite hardware and budgetary resources.
5. Massive data processing: several applications ingest daily or weekly CSV files of several tens of megabytes, generating memory and CPU consumption peaks.

## 3. Technical diagnosis: understanding bottlenecks

To target the most cost-effective levers, the study broke down the overall response time of a PHP application into three links: server-side execution, data access and client browser rendering.

### 3.1. The impact of the PHP engine version

PHP is an interpreted language: on each request, the server reads the code, parses it and compiles it into intermediate instructions (opcodes) executed by the Zend engine. Major changes between PHP 5 and PHP 8 (notably the arrival of the Just-In-Time compiler or JIT) transformed the engine's efficiency.

**Table 1: comparison of execution times by PHP version on standard operations (source: OnlinePHP.io Benchmarks).**

| PHP version | Math calculations (s) | Text strings (s) | Loops (s) | Conditions (s) | Total time (s) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PHP 5.3.29 | 21.14 | 17.27 | 5.03 | 4.31 | 39.01 |
| PHP 5.6.40 | 16.45 | 16.20 | 4.75 | 4.63 | 25.91 |
| PHP 7.4.33 | 4.39 | 3.75 | 4.39 | 3.19 | 11.77 |
| PHP 8.2.27 | 4.38 | 4.74 | 4.80 | 3.76 | 17.68 |
| PHP 8.3.18 | 4.38 | 4.74 | 4.80 | 3.76 | 17.68 |

> **Key observation:** Simply moving from PHP 5.6 to PHP 7.4 or 8.2 divides raw execution time by **3.8 to 3.9** (from 69.19 s to 17.52 s), without even modifying the scripts' business logic.

### 3.2. The OPcache mechanism: avoiding recompilation

By default, PHP rereads, parses and compiles the same script on each request. **OPcache** stores the result of this compilation in shared memory (RAM).

```text
Without OPcache (on each request):
[PHP file] -> [Read] -> [Parse] -> [Compile] -> [Execute]

With OPcache:
[PHP file] -> [Memory check] -> [Direct execution]
```

**Table 2: impact of enabling OPcache on a production server.**

| Metric | Without OPcache | With OPcache |
| :--- | :--- | :--- |
| **Throughput (Requests/sec)** | ~9,000 requests in 2.8 s | Significantly higher |
| **Total execution time** | 76 seconds | 26 seconds |
| **CPU usage** | 90% to 100% | 25% to 30% |

### 3.3. Hardware resources: the "single-thread" and RAM rule

An architectural subtlety conditions the sizing of PHP servers: PHP is **single-threaded**. A given HTTP request uses only one CPU core at a time. Consequently:

* CPU frequency (GHz): determines the execution speed of an individual page and reduces Time To First Byte (TTFB). Moving from a 2.0 GHz core to 3.0 GHz improves a server's maximum throughput by more than 30%.
* Number of cores: only increases the capacity to handle multiple users simultaneously, without speeding up an isolated heavy script.
* Random-access memory (RAM): avoids recourse to the disk swap file (SWAP). Modern RAM is on average **11 times faster** than the best NVMe SSDs.

### 3.4. PHP's structural limits on large data volumes

When an application must sort, filter or aggregate hundreds of thousands of lines from CSV files, PHP reaches its limits compared with compiled languages such as C or Rust. In PHP, each variable is encapsulated in an internal structure accompanied by a garbage collector: a simple integer occupies about 24 bytes versus 8 bytes in C/Rust.

**Table 3: comparative memory footprint for storing 100,000 integers in RAM.**

| Execution language | Execution type | Memory for 100,000 integers | Memory overhead |
| :--- | :--- | :--- | :--- |
| C | Native compiled (multithreading possible) | 0.76 MB | Reference (1×) |
| Rust | Native compiled (multithreading possible) | 0.80 MB | $\sim 1.05\times$ |
| PHP | Interpreted (single-threaded per request) | 14.60 MB | **18$\times$ more memory-hungry** |

## 4. Experiments and code benchmarks performed

Beyond the state of the art, several test protocols were executed in a local environment (PHP 8.3.6) to concretely measure the hidden cost of certain programming habits observed in legacy code.

### 4.1. The hidden cost of warnings and the `@` operator

In legacy applications, warnings related to undefined array indices are hidden using the silence operator `@` or by disabling error display. However, PHP fully builds and formats the error message in the background before ignoring it.

**Table 4: measured impact of PHP error handling on a loop of one million iterations.**

| Test scenario | Run 1 (s) | Run 2 (s) | Run 3 (s) | Slowdown factor |
| :--- | :--- | :--- | :--- | :--- |
| Clean code (no warning generated) | 0.0113 | 0.0116 | 0.0118 | Reference (1×) |
| Null coalescing operator (`?? null`) | 0.0249 | 0.0240 | 0.0237 | $\sim 2.1\times$ |
| Warning suppressed with the `@` operator | 0.1962 | 0.1928 | 0.1957 | **$\sim 17\times$ slower** |
| Warning handled by the default handler | 5.1034 | 5.3212 | 5.3748 | **$\sim 450\times$ slower** |

> **Lesson:** Hiding an error with `@` still slows processing by a factor of 17, while an uncaught warning multiplies execution time by more than 450. Systematic use of the `??` operator (null coalescing) eliminates this bottleneck.

### 4.2. Native C functions and algorithmic complexity

Two other experiments illustrate the direct impact of the quality of PHP code writing:

* Favor native functions written in C: on an array of 10 million elements (average over 100 runs), counting via the native `count()` function takes **138 nanoseconds**, versus **82.6 milliseconds** for manual counting with a `foreach` loop, a performance gap greater than a factor of 500,000. Likewise, preferring `str_replace()` over `preg_replace()` for fixed text avoids the costly initialization of the regular expression engine, and writing `$array[] = $val` avoids the function call overhead of `array_push()`.
* Avoid nested searches: searching for an identifier in a list inside a loop via `in_array()` generates quadratic complexity of $O(N \times M)$. By first converting the allowed list into an associative array via `array_flip()` and then testing key existence with `isset()`, the search becomes constant time $O(1)$ and the overall algorithm becomes linear $O(N)$.

## 5. Field application: audit and solutions for the IT center

The analysis of how applications actually operate, illustrated in particular by an **internal business application** (mostly read-only, fed by a massive weekly CSV import), made it possible to identify concrete improvement areas and provide architectural responses suited to public-sector constraints.

### 5.1. Diagnosis on the concrete case of a business application

Network inspection of a feature of this application revealed two major optimization opportunities:

* Massive HTML DOM overload: the page generates at once a table containing all records, reaching a transferred weight of **464.18 MB** (for a total of 476.36 MB and 1 min 35 s of full loading), whereas a smooth web page should not exceed 5 MB.

> **Visualization of page weight:**
> * Recommended ideal: `██░░░░░░░░░░░░░░░░░░` (5 MB)
> * Observed page: `████████████████████` **(464 MB)**


* Server wait on stylesheets: static resources (`all.min.css`, `Font.css`, `global.css`) spend **99% of their loading time waiting for a server response** (TTFB of 613 ms) due to a lack of suitable browser cache headers.

### 5.2. Catalog of selected optimization levers

Six technical levers directly compatible with the administration's security rules and internal repositories were formalized:

**Table 5: summary of optimization levers adapted to the technical context.**

| Technical layer | Recommended solution | Mechanism and expected benefit |
| :--- | :--- | :--- |
| PHP engine & server | PHP 8 migration + fine configuration | Stores precompiled scripts in shared memory. Reduces CPU usage from 90-100% to 25-30% and divides overall processing time by nearly 3. |
| Memory management | Generators (`yield`) and `unset()` | Allows reading CSV files line by line without loading the entire file into RAM, avoiding `memory_limit` overruns. |
| Heavy processing | Delegating imports | Execution via `exec()` or `shell_exec()` from PHP to a C/C++ or Rust binary. Speed up to 100$\times$ higher and minimal RAM footprint. |
| Database | `EXPLAIN ANALYZE` audit | Identifies slow queries and physically precomputes (PostgreSQL) complex aggregations on low-volatility data via materialized views. |
| Application cache | Deployment of Redis or Memcached in RAM | Caches the results of frequent filters, avoiding SQL queries of nearly a minute. |
| Client interface (Frontend) | Server pagination, Lazy Loading and HTTP cache | Reduces page weight from >460 MB to a few hundred kilobytes and eliminates re-downloading of CSS/JS files. |

### 5.3. Example of recommended OPcache server configuration

Although enabled by default since PHP 5.5, OPcache requires configuration suited to production business applications:

```ini
opcache.memory_consumption = 128      ; Allocates 128 MB of shared RAM for bytecode
opcache.max_accelerated_files = 20000 ; Maximum number of PHP files cached
opcache.validate_timestamps = 0       ; Disables disk check on each request
opcache.save_comments = 0             ; Saves memory by ignoring comments
opcache.enable_cli = 1                ; Enables OPcache for CSV import CLI scripts
```

## 6. Action plan, governance and return on investment

To turn these technical recommendations into lasting gains across the IT center without risking regression on critical tools, a five-step methodological roadmap was defined:

1. Targeted audit of critical applications: map the estate by PHP version, identify costly SQL queries (`EXPLAIN ANALYZE`), measure page weight and check the existing server configuration.
2. Prioritization by impact/effort ratio: first deploy quick low-risk gains (OPcache activation, static HTTP cache, pagination of giant tables), followed by migrations to internally validated PHP 8 and PostgreSQL versions (replacing obsolete functions such as `pg_exec()`).
3. Rigorous performance and non-regression testing: validate each change on production-equivalent virtualized environments before any go-live.
4. Progressive deployment and monitoring: track key metrics (TTFB, CPU load, RAM consumption) after each production release.
5. Embedding a "performance culture": train development teams in modern PHP best practices, automated testing and compiled languages (C/Rust), and establish close collaboration between developers and OpenStack infrastructure teams.

### Cost/benefit assessment for the organization

* Initial investment: the approach requires significant engineering time for auditing legacy code, redesigning queries and upskilling teams.
* Strategic and operational benefits: in the medium term, optimization directly reduces the hardware bill by avoiding overprovisioning of virtual machines on the private OpenStack cloud. It guarantees agents a responsive work tool, reduces the risk of interruption during mass processing and strengthens the overall security as well as the regulatory compliance (GDPR) of the information system.

## 7. Glossary of key concepts

| Term | Accessible definition |
| :--- | :--- |
| **OPcache / Opcode** | Mechanism that keeps in RAM the intermediate translation (opcode) of a PHP script in order to avoid the computer rereading and retranslating the file on each visit. |
| **Redis** | Ultra-fast database stored directly in RAM, used as a buffer memory to avoid constantly querying the main database. |
| **TTFB (Time To First Byte)** | Time elapsed between the user's click and receipt of the very first response byte sent by the server. Key indicator of server responsiveness. |
| **Single-threaded** | Execution mode in which a program processes instructions one after another on a single CPU core, without being able to divide the same task in parallel. |
| **Server pagination** | Technique consisting in sending the browser only the 20 or 50 lines visible on screen rather than the entirety of a file containing several hundred thousand lines. |