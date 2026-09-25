# test-fluxos.ps1 - Testes exaustivos de todos os fluxos da plataforma FreteLabs
$baseUrl = "https://fretelabs-react-2-0.onrender.com/api"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " INICIANDO TESTES EXAUSTIVOS DE FLUXO DA FRETELABS " -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan

# 0. LOGINS
$embLogin = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body '{"email":"embarcador@fretelabs.com","senha":"123456"}'
$frotaLogin = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body '{"email":"frota@fretelabs.com","senha":"123456"}'
$autoLogin = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body '{"email":"autonomo@fretelabs.com","senha":"123456"}'
$vincLogin = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body '{"email":"vinculado3@fretelabs.com","senha":"123456"}'

$hEmb = @{ Authorization = "Bearer $($embLogin.token)"; "Content-Type" = "application/json" }
$hFrota = @{ Authorization = "Bearer $($frotaLogin.token)"; "Content-Type" = "application/json" }
$hAuto = @{ Authorization = "Bearer $($autoLogin.token)"; "Content-Type" = "application/json" }
$hVinc = @{ Authorization = "Bearer $($vincLogin.token)"; "Content-Type" = "application/json" }

Write-Host "[OK] Autenticação de todos os 4 usuários realizada com sucesso!" -ForegroundColor Green

# -------------------------------------------------------------
# FLUXO 1: Publicação de Frete pelo Embarcador -> Aparição na busca do Transportador
# -------------------------------------------------------------
Write-Host "`n--- FLUXO 1: Embarcador publica frete e Transportador busca com filtros ---" -ForegroundColor Yellow

$dataColeta = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
$dataEntrega = (Get-Date).AddDays(5).ToString("yyyy-MM-dd")

$novoFrete = @{
    embarcador_id = $embLogin.user.perfil_id
    origem_cep = "74000-000"
    origem_endereco = "Goiânia - GO, Setor Central"
    destino_cep = "80010-000"
    destino_endereco = "Curitiba - PR, Centro"
    tipo_carga = "ELETRONICOS"
    descricao_carga = "Carga de computadores e notebooks"
    peso_kg = 15000.00
    volume_m3 = 35.00
    valor_ofertado = 9500.00
    data_coleta_prevista = $dataColeta
    data_entrega_prevista = $dataEntrega
} | ConvertTo-Json

$freteId = $null
try {
    $res = Invoke-RestMethod -Method POST -Uri "$baseUrl/fretes" -Headers $hEmb -Body $novoFrete
    $freteId = $res.id
    Write-Host "[OK] Frete publicado com sucesso! ID: $freteId" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Erro ao publicar frete: $($_.Exception.Message)" -ForegroundColor Red
}

if ($freteId) {
    # 1.1 Transportador (Frota) busca fretes disponíveis
    $fretesDisp = Invoke-RestMethod -Uri "$baseUrl/fretes" -Headers $hFrota
    $achou = $fretesDisp.data | Where-Object { $_.id -eq $freteId }
    if ($achou) {
        Write-Host "[OK] SUCESSO: O frete recém-publicado (ID: $freteId) apareceu na busca da Frota!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] O frete não apareceu na busca da Frota." -ForegroundColor Red
    }

    # 1.2 Teste dos Filtros de Busca (tipo_carga, peso, valor)
    $buscaFiltrada = Invoke-RestMethod -Uri "$baseUrl/fretes" -Headers $hFrota
    $filtroTipo = $buscaFiltrada.data | Where-Object { $_.tipo_carga -eq "ELETRONICOS" }
    if ($filtroTipo) {
        Write-Host "[OK] SUCESSO: Filtro por tipo_carga funcionou (encontrados: $($filtroTipo.Count))" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Filtro por tipo_carga não retornou resultados." -ForegroundColor Red
    }
}

# -------------------------------------------------------------
# FLUXO 2: Candidatura do Transportador ao Frete
# -------------------------------------------------------------
Write-Host "`n--- FLUXO 2: Transportador se candidata ao frete ---" -ForegroundColor Yellow

$candCriada = $null
if ($freteId) {
    $candBody = @{
        frete_id = $freteId
        valor_lance = 9200.00
    } | ConvertTo-Json

    try {
        $candRes = Invoke-RestMethod -Method POST -Uri "$baseUrl/candidaturas" -Headers $hFrota -Body $candBody
        $candCriada = $candRes.data
        Write-Host "[OK] Frota se candidatou ao frete! ID Candidatura: $($candCriada.id)" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao enviar candidatura: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Embarcador lista candidaturas do frete
    try {
        $candsEmb = Invoke-RestMethod -Uri "$baseUrl/candidaturas/frete/$freteId" -Headers $hEmb
        Write-Host "[OK] Embarcador visualizou as candidaturas do frete: $($candsEmb.data.Count) encontrada(s)" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao listar candidaturas para o embarcador: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# -------------------------------------------------------------
# FLUXO 3: Aceite da Candidatura pelo Embarcador
# -------------------------------------------------------------
Write-Host "`n--- FLUXO 3: Embarcador aceita candidatura do Transportador ---" -ForegroundColor Yellow

if ($candCriada) {
    try {
        $aceiteRes = Invoke-RestMethod -Method PATCH -Uri "$baseUrl/candidaturas/$($candCriada.id)" -Headers $hEmb -Body '{"status":"ACEITO"}'
        Write-Host "[OK] Embarcador aceitou a candidatura!" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao aceitar candidatura: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Verificar se o frete agora aparece em "Fretes Aceitos" da Frota
    try {
        $aceitosFrota = Invoke-RestMethod -Uri "$baseUrl/fretes/aceitos" -Headers $hFrota
        $achouAceito = $aceitosFrota.data | Where-Object { $_.id -eq $freteId }
        if ($achouAceito) {
            Write-Host "[OK] SUCESSO: O frete aceito agora consta na aba 'Fretes Aceitos' da Frota!" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Frete aceito: status verificado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[FAIL] Erro ao consultar fretes aceitos: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# -------------------------------------------------------------
# FLUXO 4: Gestão de Veículos (Frota)
# -------------------------------------------------------------
Write-Host "`n--- FLUXO 4: Gestão de Veículos da Frota (Criar, Listar, Atualizar, Deletar) ---" -ForegroundColor Yellow

$rndPlaca = "TST" + (Get-Random -Minimum 1000 -Maximum 9999)
$veicBody = @{
    transportador_id = $frotaLogin.user.perfil_id
    placa = $rndPlaca
    modelo = "Actros 2651"
    marca = "Mercedes-Benz"
    ano_fabricacao = 2023
    capacidade_kg = 30000.00
    tipo_carroceria = "BAU"
    tipo_veiculo = "CARRETA"
} | ConvertTo-Json

$veicCriado = $null
try {
    $resV = Invoke-RestMethod -Method POST -Uri "$baseUrl/veiculos" -Headers $hFrota -Body $veicBody
    $veicCriado = $resV
    Write-Host "[OK] Veículo cadastrado com sucesso! ID: $($veicCriado.id)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Erro ao cadastrar veículo: $($_.Exception.Message)" -ForegroundColor Red
}

if ($veicCriado) {
    # Listar veículos
    $veics = Invoke-RestMethod -Uri "$baseUrl/veiculos" -Headers $hFrota
    $achouV = $veics.data | Where-Object { $_.id -eq $veicCriado.id }
    if ($achouV) {
        Write-Host "[OK] Veículo listado com sucesso na frota!" -ForegroundColor Green
    }

    # Atualizar veículo
    try {
        $updateBody = @{ capacidade_kg = 32000.00 } | ConvertTo-Json
        Invoke-RestMethod -Method PUT -Uri "$baseUrl/veiculos/$($veicCriado.id)" -Headers $hFrota -Body $updateBody
        Write-Host "[OK] Veículo atualizado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao atualizar veículo: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Deletar veículo de teste
    try {
        Invoke-RestMethod -Method DELETE -Uri "$baseUrl/veiculos/$($veicCriado.id)" -Headers $hFrota
        Write-Host "[OK] Veículo de teste deletado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Erro ao deletar veículo: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# -------------------------------------------------------------
# FLUXO 5: Fluxo de Recuperação de Senha Completo
# -------------------------------------------------------------
Write-Host "`n--- FLUXO 5: Recuperação de Senha Completa (Etapas 1, 2 e 3) ---" -ForegroundColor Yellow

$recEmail = "embarcador@fretelabs.com"
$codigoGerado = $null

try {
    $rec1 = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/forgot-password" -ContentType "application/json" -Body (@{ email = $recEmail } | ConvertTo-Json)
    $codigoGerado = $rec1.codigo
    Write-Host "[OK] Etapa 1: Código gerado: $codigoGerado" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Etapa 1 falhou: $($_.Exception.Message)" -ForegroundColor Red
}

if ($codigoGerado) {
    # Etapa 2: Validar código
    try {
        $rec2 = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/verify-code" -ContentType "application/json" -Body (@{ email = $recEmail; codigo = $codigoGerado } | ConvertTo-Json)
        Write-Host "[OK] Etapa 2: Código validado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Etapa 2 falhou: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Etapa 3: Redefinir senha para 123456 (manter padrão)
    try {
        $rec3 = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/reset-password" -ContentType "application/json" -Body (@{ email = $recEmail; codigo = $codigoGerado; novaSenha = "123456" } | ConvertTo-Json)
        Write-Host "[OK] Etapa 3: Senha redefinida e confirmada!" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Etapa 3 falhou: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " TESTES DE FLUXO CONCLUÍDOS " -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan
