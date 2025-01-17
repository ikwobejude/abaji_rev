const ApprovalLevels = require("../model/Approval_level");
const ApprovalTypes = require("../model/Approval_type");
const { Sequelize } = require("sequelize");

class Approval {
  constructor() {
    this.approvalLevels = ApprovalLevels;
    this.approvalTypes = ApprovalTypes;
  }

  async createApprovalTypes(data) {
    return await this.approvalTypes.create({
      approval_type: data.approvalType,
      total_number_of_approval: data.totalApprovals,
      service_id: data.service_id,
    });
  }
  async updateApprovalType(id) {
     const approvalType = await this.approvalTypes.findByPk(id);
     if (!approvalType) {
       throw new Error("Approval type not found");
     }
    return await approvalType.update({
       approval_type: data.approvalType,
       total_number_of_approval: data.totalApprovals,
     });
  }

  async fetchApprovalTypes(service_id) {
    return await this.approvalTypes.findAll({
      where: { service_id: service_id },
      raw: true,
    });
  }

  async updateApprovalLevel(data) {
    const approvalType = await this.approvalTypes.findOne({
      where: { id: data.typeId },
    });

    if (!approvalType) {
      throw new Error("Approval type not found");
    }
    const { total_number_of_approval } = approvalType;

    const approvalLevel = await this.approvalLevels.findOne({
      where: { level_id: data.levelId },
      raw: true,
    });

    if (!approvalLevel) {
      throw new Error("Approval level not found");
    }

    const { sequence_number } = approvalLevel;

    if (sequence_number < total_number_of_approval) {
      approvalLevel.sequence_number += 1;
      await approvalLevel.save();

      return approvalLevel;
    } else {
      return { message: "Approval Process Already Completed" };
    }
  }
  async CheckApprovalLevel(data) {
    const { designation, application_type } = data;
    const level = await this.approvalLevels.findAll({
      where: {
        designation: designation,
        application_type: application_type,
      },
    });
    return level;
  }
}

module.exports = new Approval();
