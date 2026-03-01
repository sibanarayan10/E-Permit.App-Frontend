export interface SignatoryDetails {
    name?: string;
    designation?: string;
    department?: string;
    signature?: string;
    date?: Date | string;
    time?: string;
}

export interface PeriodOfWork {
    date?: Date | string;
    hrs?: string;
}

export interface PersonOrContractorResponsible {
    name?: string;
    nameOfContractorsSupervisor?: string;
    nameOfDepartmentalRepresentative?: string;
}

export interface Schedule {
    startTimeDate?: PeriodOfWork;
    finishTimeDate?: PeriodOfWork;
}

export interface HazardsAssociated {
    fallingObjects?: boolean;
    highWinds?: boolean;
    weatherConditions?: boolean;
    unguardedEdges?: boolean;
    manualHandlingOfLoads?: boolean;
    riskOfFallingPersons?: boolean;
    overheadElectricCables?: boolean;
    unsecuredLadders?: boolean;
    illumination?: boolean;
    unevenFloorSurfaces?: boolean;
    fragileRoofs?: boolean;
    equipmentMachinery?: boolean;
    other?: string;
}

export interface FallProtectionSystem {
    travelRestraintSystem?: boolean;
    workPositioningSystem?: boolean;
    fallArrestSystem?: boolean;
}

export interface WorkContextItem {
    selected?: boolean;
    hazardsAssessed?: string; // "YES" | "NO"
    canWorkProceed?: string; // "YES" | "NO"
    remark?: string;
}

export interface WorkContextOtherItem extends WorkContextItem {
    description?: string;
}

export interface WorkContextRoofItem extends WorkContextItem {
    roofPitchAngle?: string;
}

export interface HeavyPlantShutDowns {
    eotCraneBeltConveyor?: string; // YES, NO, NA
    gasLinesBusBars?: string; // YES, NO, NA
    pusherCar?: string; // YES, NO, NA
}

export interface WorkContextHeavyPlantItem extends WorkContextItem {
    description?: string;
    shutDownTaken?: string; // YES, NO
    shutDownsObtained?: HeavyPlantShutDowns;
}

export interface TowerStructureType {
    comms?: boolean;
    energyTransmission?: boolean;
    cableWayTower?: boolean;
}

export interface WorkContextTowerItem extends WorkContextItem {
    type?: TowerStructureType;
}

export interface WorkContext {
    onRoofSurface?: WorkContextRoofItem;
    nearExposedEdge?: WorkContextItem;
    nearOpenHole?: WorkContextItem;
    onHeavyPlantAndMachinery?: WorkContextHeavyPlantItem;
    onTowerStructure?: WorkContextTowerItem;
    erectingScaffold?: WorkContextItem;
    onCrane?: WorkContextOtherItem;
    other?: WorkContextOtherItem;
}

export interface FallProtectionEquipmentItem {
    selected?: boolean;
    inspected?: string; // YES, NO
    remark?: string;
}

export interface FallProtectionEquipment {
    lanyardFixedLength?: FallProtectionEquipmentItem;
    rearAttachment?: FallProtectionEquipmentItem;
    frontAttachment?: FallProtectionEquipmentItem;
    isConnectorCompatible?: FallProtectionEquipmentItem;
    retractableLanyardType2NoWinchWebbing?: FallProtectionEquipmentItem;
    retractableLanyardType2NoWinchCable?: FallProtectionEquipmentItem;
    retractableLanyardType3WinchCable?: FallProtectionEquipmentItem;
    poleStrapBelt?: FallProtectionEquipmentItem;
    fullBodyHarnessFallArrest?: FallProtectionEquipmentItem;
    fullBodyHarnessWorkPositioning?: FallProtectionEquipmentItem;
    safetyNet?: FallProtectionEquipmentItem;
}

export interface MethodOfAccessItem {
    selected?: boolean;
    inspected?: string; // YES, NO
    surroundingHazardsControlled?: string; // YES, NO
}

export interface MethodOfAccessExtensionLadder extends MethodOfAccessItem {
    personToFootLadderAvailable?: boolean;
}

export interface MethodOfAccessFixedLadder extends MethodOfAccessItem {
    cableFallArrestDeviceAvailable?: boolean;
}

export interface MethodOfAccessElevatingPlatform extends MethodOfAccessItem {
    adjustableLanyardAvailable?: boolean;
}

export interface MethodOfAccessManCage extends MethodOfAccessItem {
    doggerAvailableInCage?: boolean;
}

export interface MethodOfAccessScissorLift extends MethodOfAccessItem {
    noPPERequired?: boolean;
}

export interface MethodOfAccessClimbing extends MethodOfAccessItem {
    doubleHookLanyardSuitable?: boolean;
    poleStrapBeltAvailable?: boolean;
}

export interface MethodOfAccessStaircase extends MethodOfAccessItem {
    railingAvailable?: boolean;
}

export interface MethodOfAccessMonkeyLadder extends MethodOfAccessItem {
    cageAvailable?: boolean;
}

export interface MethodOfAccessScaffolding extends MethodOfAccessItem {
    asPerStandard?: boolean;
}

export interface MethodOfAccessOther extends MethodOfAccessItem {
    description?: string;
    controlMeasureCheck?: boolean;
}

export interface MethodOfAccess {
    portableExtensionLadder?: MethodOfAccessExtensionLadder;
    fixedLadderWithCable?: MethodOfAccessFixedLadder;
    elevatingWorkPlatform?: MethodOfAccessElevatingPlatform;
    manCage?: MethodOfAccessManCage;
    scissorLift?: MethodOfAccessScissorLift;
    climbingTechnique?: MethodOfAccessClimbing;
    permanentStaircase?: MethodOfAccessStaircase;
    permanentMonkeyLadder?: MethodOfAccessMonkeyLadder;
    scaffolding?: MethodOfAccessScaffolding;
    other?: MethodOfAccessOther;
}

export interface AuthorizedPerson {
    name?: string;
    heightPassRefNo?: string;
}

export interface RiskAssessment {
    HIRAOrJSACompleted?: string; // YES, NO, ""
}

export interface PermissionToWork {
    personResponsibleForWork?: SignatoryDetails;
    executingAgency?: SignatoryDetails;
    authorisingPerson?: SignatoryDetails;
}

export interface JobCompletionCancellation {
    personResponsibleForWork?: SignatoryDetails;
    executingAgency?: SignatoryDetails;
    authorisingPerson?: SignatoryDetails;
}

export interface ExecutionApproval {
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date | string;
    repDetails?: SignatoryDetails;
}

export interface IssuerApproval {
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date | string;
    issuerDetails?: SignatoryDetails;
}

export interface KeyControlMeasures {
    // This section was removed and merged into MethodOfAccess
    // Keeping interface if needed for backwards compat but it's empty now or removed
}

export interface ClosureInitiator {
    confirmationText?: string;
    initiatedBy?: string;
    initiatedAt?: Date | string;
    initiatorDetails?: SignatoryDetails;
}

export interface ClosureExecutor {
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date | string;
}

export interface ClosureIssuerChecklist {
    allWorkCompleted?: string;
    jobCompletionReported?: string;
}

export interface ClosureIssuer {
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date | string;
}

export interface Closure {
    initiatorClosure?: ClosureInitiator;
    executorApproval?: ClosureExecutor;
    issuerChecklist?: ClosureIssuerChecklist;
    issuerApproval?: ClosureIssuer;
    closedAt?: Date | string;
    closedBy?: string;
}

export interface PendingRenewal {
    from?: PeriodOfWork;
    to?: PeriodOfWork;
    renewalReason?: string;
    requestedBy?: string;
    requestedAt?: Date | string;
    executorApproval?: {
        approved?: boolean;
        approvedBy?: string;
        approvedAt?: Date | string;
    };
    issuerApproval?: {
        approved?: boolean;
        approvedBy?: string;
        approvedAt?: Date | string;
    };
    issuerDetails?: SignatoryDetails;
}

export interface HeightPermit {
    _id?: string;
    permitNumber: string;
    protocolNumber?: string;
    srNo?: string;
    status?: string;
    workflowStage?: string;
    createdBy?: any;
    assignedExecutor?: any;
    assignedExecutorAt?: Date | string;
    assignedExecutorBy?: any;
    assignedIssuer?: any;
    assignedIssuerAt?: Date | string;
    assignedIssuerBy?: any;
    personOrContractorResponsible?: PersonOrContractorResponsible;
    jobLocation?: string;
    jobDescription?: string;
    schedule?: Schedule;
    hazardsAssociated?: HazardsAssociated;
    fallProtectionSystem?: FallProtectionSystem;
    workContext?: WorkContext;
    fallProtectionEquipment?: FallProtectionEquipment;
    methodOfAccess?: MethodOfAccess;
    // keyControlMeasures removed
    riskAssessment?: RiskAssessment;
    numberOfPersonsAuthorized?: AuthorizedPerson[]; // Changed to array
    permissionToWork?: PermissionToWork;
    jobCompletionCancellation?: JobCompletionCancellation;
    incidentsOrNearMisses?: string; // Renamed
    initiatorSignature?: SignatoryDetails;
    // importantNotes removed
    executionApproval?: ExecutionApproval;
    issuerApproval?: IssuerApproval;
    renewalCount?: number;
    isRenewed?: boolean;
    renewalReason?: string;
    pendingRenewal?: PendingRenewal;
    closure?: Closure;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    permitType?: string;
}

export interface HeightPermitCreateInput {
    permitNumber?: string;
    protocolNumber?: string;
    srNo?: string;
    personOrContractorResponsible?: PersonOrContractorResponsible;
    jobLocation?: string;
    jobDescription?: string;
    schedule?: Schedule;
    hazardsAssociated?: HazardsAssociated;
    fallProtectionSystem?: FallProtectionSystem;
    workContext?: WorkContext;
    fallProtectionEquipment?: FallProtectionEquipment;
    methodOfAccess?: MethodOfAccess;
    riskAssessment?: RiskAssessment;
    numberOfPersonsAuthorized?: AuthorizedPerson[];
    permissionToWork?: PermissionToWork;
    jobCompletionCancellation?: JobCompletionCancellation;
    incidentsOrNearMisses?: string;
    initiatorSignature?: SignatoryDetails;
}

export interface HeightPermitStats {
    Draft?: number;
    Pending_Execution?: number;
    Pending_Issuer?: number;
    Approved?: number;
    Returned?: number;
    Cancelled?: number;
    Closed?: number;
    Pending_Closure_Execution?: number;
    Pending_Closure_Issuer?: number;
    total?: number;
}
