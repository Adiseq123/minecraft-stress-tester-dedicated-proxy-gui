# 🎮 Minecraft Server Stress Tester (Dedicated SOCKS5 Proxies / SRV Resolver)

<img width="1536" height="826" alt="image" src="https://github.com/user-attachments/assets/2b6791ad-b455-4448-a0a5-69fb21385151" />

Zaawansowana aplikacja desktopowa zbudowana na bazie **Electron** oraz **Mineflayer**, przeznaczona do kontrolowanych testów wydajności, obciążenia (**stress-test**) oraz stabilności serwerów Minecraft.

W tej wersji zastosowano obsługę **dedykowanych serwerów SOCKS5 Proxy** oraz **automatyczne rozwiązywanie rekordów DNS SRV**, dzięki czemu aplikacja może poprawnie obsługiwać również serwery korzystające z niestandardowych portów lub domen SRV.

![Electron](https://img.shields.io/badge/Electron-30.x-4B8BF5?style=flat&logo=electron)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js)
![Mineflayer](https://img.shields.io/badge/Mineflayer-4.20.0-green)
![SOCKS5](https://img.shields.io/badge/Proxy-SOCKS5-orange)
![DNS SRV](https://img.shields.io/badge/DNS-SRV-blue)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey)

---

## 🖥️ Interfejs GUI

Aplikacja posiada nowoczesny interfejs graficzny, który pozwala na wygodne zarządzanie parametrami testu bez konieczności modyfikowania kodu źródłowego.

### Najważniejsze funkcje

- 🌑 **Nowoczesny Dark Theme** — przejrzysty panel sterowania.
- ⚙️ **Konfiguracja parametrów** — możliwość zmiany ustawień testu bez edycji plików `.js`.
- 🌐 **Obsługa dedykowanych SOCKS5 Proxy** — wykorzystanie własnej listy prywatnych proxy.
- 📋 **Logi w czasie rzeczywistym** — podgląd połączeń, błędów proxy, DNS oraz stanu botów.
- 🤖 **Automatyczne zarządzanie botami** — liczba botów może być dostosowana do liczby dostępnych proxy.
- 💬 **Customowe wiadomości i komendy** — możliwość definiowania aktywności botów.

---

## 🔑 Kluczowe cechy tej wersji

### 🌐 Dedykowana lista SOCKS5 Proxy

W przeciwieństwie do poprzedniej wersji wykorzystującej publiczne listy proxy, ta wersja została przygotowana z myślą o **dedykowanych i prywatnych serwerach SOCKS5**, np. oferowanych przez dostawców takich jak Webshare.

Proxy mogą wymagać uwierzytelnienia za pomocą:

```text
userId
password
```

Dzięki wykorzystaniu własnych, stabilniejszych proxy połączenia mogą być bardziej niezawodne niż w przypadku publicznych list.

### 🔄 1 Bot = 1 IP

Domyślna liczba botów może zostać automatycznie dopasowana do liczby skonfigurowanych proxy.

Schemat działania:

```text
Proxy #1 → Bot #1
Proxy #2 → Bot #2
Proxy #3 → Bot #3
Proxy #4 → Bot #4
```

Liczba botów jest określana na podstawie:

```text
PROXIES.length
```

Pozwala to zachować przypisanie pojedynczego bota do konkretnego adresu proxy.

### 🌍 Automatyczne DNS SRV

Aplikacja wykorzystuje `dns.resolveSrv` do automatycznego sprawdzania rekordów **DNS SRV** przed nawiązaniem połączenia.

Jest to szczególnie przydatne w przypadku serwerów, które korzystają z domen wskazujących na niestandardowy host lub port.

Mechanizm pozwala poprawnie ustalić docelowy adres oraz port serwera przed rozpoczęciem połączenia przez SOCKS5 Proxy.

---

## 🤖 Funkcje Botów — Mineflayer

### 🎮 Emulacja zachowania gracza

Boty mogą wykonywać podstawowe czynności imitujące zachowanie prawdziwych graczy:

- chodzenie,
- skakanie,
- sprint,
- kucanie,
- machanie ręką,
- losowe rozglądanie się w przestrzeni 3D,
- losowe aktywności,
- opóźnienia podczas wykonywania określonych czynności.

Dostępny jest również parametr:

```text
humanTypingDelay
```

odpowiadający za opóźnienie podczas symulowania wpisywania tekstu.

### 🔐 Automatyczna autoryzacja

Boty mogą automatycznie reagować na komunikaty związane z rejestracją oraz logowaniem.

Po wykryciu odpowiednich fraz mogą zostać wysłane komendy:

```text
/register
/login
```

z wykorzystaniem skonfigurowanego hasła oraz naturalnego opóźnienia.

### 💬 Symulacja czatu

Boty mogą okresowo wysyłać wiadomości lub wykonywać komendy, np.:

```text
/help
/ping
```

Wiadomości mogą zawierać unikalny identyfikator pozwalający rozróżnić aktywność poszczególnych botów.

### 🔄 Auto-Reconnect

W przypadku rozłączenia bot automatycznie próbuje ponownie nawiązać połączenie.

Mechanizm reconnectu uwzględnia również sytuacje związane z rate-limitami oraz czasowym odrzucaniem połączeń przez serwer.

---

## 📄 Konfiguracja Proxy

Dedykowane proxy należy uzupełnić bezpośrednio w pliku:

```text
botterkawebshare.js
```

W sekcji:

```javascript
PROXIES
```

należy umieścić własną listę serwerów SOCKS5 wraz z wymaganymi danymi uwierzytelniającymi.

> ⚠️ **Przed uruchomieniem programu upewnij się, że sekcja `PROXIES` zawiera poprawne i aktywne serwery SOCKS5.**

Liczba skonfigurowanych proxy wpływa również na domyślną liczbę uruchamianych botów.

---

## ⚠️ Ważne informacje

Dedykowane lub płatne proxy są zazwyczaj stabilniejsze od publicznych list, jednak ich jakość oraz dostępność zależy od konkretnego dostawcy.

Na działanie testu mogą wpływać również zabezpieczenia serwera Minecraft, takie jak:

- AntiBot,
- rate-limit,
- Anti-VPN,
- limity połączeń,
- zabezpieczenia proxy/backendu.

### Zalecane zastosowanie

Program jest przeznaczony do:

- testowania własnych serwerów Minecraft,
- testów środowisk developerskich,
- testów lokalnych,
- autoryzowanych testów infrastruktury.

> **Nie używaj programu do obciążania lub zakłócania działania serwerów osób trzecich bez odpowiedniej zgody.**

---

## 📋 Wymagania

Do uruchomienia projektu ze źródeł wymagane są:

- [Node.js](https://nodejs.org/) **18.x lub nowszy**,
- `mineflayer`,
- `socks`.

---

## 📥 Pobieranie

Gotową wersję programu dla systemu Windows (`.exe`) można pobrać z zakładki **[Releases](../../releases)**.

---

## 🛠️ Uruchomienie z kodu źródłowego

### 1. Zainstaluj zależności

```bash
npm install
```

### 2. Uzupełnij proxy

Otwórz:

```text
botterkawebshare.js
```

i uzupełnij własne serwery SOCKS5 w sekcji:

```text
PROXIES
```

### 3. Uruchom aplikację

```bash
npm start
```

---

## 📦 Kompilacja aplikacji

### Windows — `.exe`

```bash
npm run dist:win
```

Gotowy plik `.exe` znajdzie się w folderze:

```text
dist/
```

### Linux

```bash
npm run dist:linux
```

Wygenerowane pliki zostaną zapisane w folderze `dist/`.

---

## 🧩 Technologie

- **Electron** — aplikacja desktopowa i interfejs GUI,
- **Node.js** — środowisko uruchomieniowe,
- **Mineflayer** — obsługa botów Minecraft,
- **SOCKS5** — połączenia przez dedykowane serwery proxy,
- **DNS SRV** — automatyczne rozwiązywanie rekordów serwerów Minecraft.

---

## ⚖️ Licencja i zastrzeżenie

Projekt został stworzony **wyłącznie w celach edukacyjnych oraz do autoryzowanych testów wydajnościowych, obciążeniowych i stabilności własnych serwerów Minecraft**.

Użytkownik jest odpowiedzialny za sposób wykorzystania programu oraz za posiadanie odpowiednich uprawnień do przeprowadzania testów.

Autor nie ponosi odpowiedzialności za niewłaściwe wykorzystanie programu.
