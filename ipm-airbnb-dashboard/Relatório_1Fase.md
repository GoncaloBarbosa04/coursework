# Link do Protótipo em Figma

https://www.figma.com/design/WrKSm8sHnELpJ3T9msVBSM/IPM---Projeto?node-id=0-1&t=KGXJtTIp0fTVgRdV-1


# Guidelines de Usabilidade

A usabilidade do programa recai sobre uma navbar, que permite navegar entre três páginas (estatísticas, anormalias e comparações) e uma sidebar, diferente em cada página, que permite aplicar filtros, explorar com maior pormenor algumas estatísticas e mudar a cidade em análise.

Em termos de design foram utilizados containers de fundo branco para apresentação de gráficos e tabelas, e de fundo cinzento de realce a dados mais relevantes e simples. Estes containers apresentam no canto superior um icon de info, que quando selecionado dá informações úteis ao utilizador sobre o mesmo. Alguns gráficos quando _"hoovered"_ fornecem informações/números precisos da estatística selecionada.

A página inicial deste protótipo permite ao utilizador escolher que cidade pretende analisar, fornecendo algumas propostas de cidade mais visualizadas. Caso este não escolha nenhuma, a aplicação não permite que o mesmo siga para a página seguinte, apresentando uma mensagem de erro.
De seguida apresenta uma dashboard de estatísticas que fazem uma análise temporal e por zonas do número de reservas e estabelecimentos, preços e por tipo de propriedade. 
Navegando para a tab de anomalias, é possível visualizar alguns dados e estatísticas gerais, sendo possível através da sidebar, ver estatísticas precisas sobre os licenciamentos dos estabelecimentos e do alojamento local.
Por fim, a página de comparações permite comparar dados trimestrais entre duas cidades.


# Resposta às Necessidades dos Perfis

As decisões de design e usabilidade foram tidas em conta com os perfis fornecidos, visando responder a todas as necessidades propostas de forma intuitiva e simples.

As necessidades do Perfil 1 são asseguradas nas diversas estatísticas apresentadas na tab "Estatísticas", com o auxiílio dos filtros presentes na sidebar. Todas as páginas, com exceção da página inicial, contêm um botão de exportação de dados no canto inferior esquerdo, com destque a laranja, que quando selecionado aciona um overlay no centro da tela, com as opções de exportação em CSV ou JSON. Quando uma destas é selecionada o programa responde com uma mensagem de sucesso.

Os frames da secção “Anomalias” foram desenhados de acordo com algumas das necessidades apresentadas pelo perfil 2, oferecendo uma visão clara sobre situações que requerem atenção. O layout apresenta uma navegação consistente, composta por filtros laterais, mapa central e indicadores numéricos à direita, garantindo visibilidade, hierarquia da informação e leitura imediata. A divisão em subframes (Gerais, Licenças e AL) permite aprofundar diferentes dimensões do problema sem sobrecarregar o utilizador, mantendo a experiência simples, organizada e orientada para a ação. Desta forma, o utilizador consegue identificar facilmente zonas críticas, percentagens de licenciamento e distribuição geográfica, otimizando a tomada de decisão.

O frame “Comparações” foi desenvolvido de acordo com as necessidades do perfil 3, privilegiando gráficos comparativos e indicadores diretos. A comparação entre cidades, acompanhada de legendas simples e cores contrastantes, facilita a interpretação rápida. Os restantes requisitos são tidos em conta através dos gráficos simples e intuitivos presentes na tab "Estatíticas", incluindo diversos dados comparativos entre zonas e tipos de propriedade. Também na tab de "Anomalias"" é possível visualizar no mapa e as áreas com maior Alojamento local, entre outros dados úteis.




