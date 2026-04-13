# Laboratórios de Informática III (2024/2025)

- Gonçalo da Silva Carmo - A104619 - GoncaloCarmo
- Gonçalo Filipe Duarte Barbosa - A104438 - GoncaloBarbosaA104438
- Simão Pedro Sá Pereira - A104535 - simaop36

### About this Project

Este projeto consiste no desenvolvimento de uma base de dados em memória, concebida para armazenar e processar de forma eficiente dados de uma plataforma de streaming musical[cite: 16]. Desenvolvido com um forte foco em princípios de Engenharia de Software, o sistema prioriza a modularidade, a reutilização de código e o encapsulamento de dados[cite: 15, 26].

A aplicação opera num "modo batch", sendo capaz de ler grandes conjuntos de dados, fazer o _parsing_ da informação e executar de forma sequencial centenas de _queries_ complexas previamente definidas num ficheiro de _input_.

### Core Competencies & Technical Skills Demonstrated

**Arquitetura de Software:** Desenho de um sistema altamente modular (separação clara entre módulos de _Parsing_, Catálogos, _Queries_, Estatísticas e _I/O_) garantindo um forte encapsulamento e abstração de dados[cite: 15, 33, 34].
**Estruturas de Dados Avançadas:** Implementação de um sistema de catálogos gerido por _Hash Tables_ (através da biblioteca `glib`), garantindo tempos de acesso (_lookup_) constantes e otimizando a pesquisa de utilizadores, artistas e músicas[cite: 20, 29, 30].
**Processamento de Dados & I/O:** Criação de um _parser_ customizado capaz de ler, validar e carregar ficheiros CSV para a memória através de estruturas rápidas e flexíveis[cite: 19, 50].

- **Performance & Profiling:** Análise rigorosa de desempenho das _queries_ e monitorização do uso de recursos. O sistema foi sujeito a _benchmarks_ de tempo de execução (~5 a 15 segundos) e consumo de memória RAM (~650 MB), permitindo identificar gargalos de performance e delinear estratégias de otimização.
